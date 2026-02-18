"use client";

/**
 * Board settings form with column management and automation rules.
 *
 * Sections:
 * - General: rename board
 * - Columns: manage core (read-only) and human-only columns
 * - Automation Rules: trigger-action model
 * - Members: placeholder for future access management
 */

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	GripVertical,
	Lock,
	Plus,
	Settings2,
	Trash2,
	Users,
	Zap,
} from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { BoardColumn } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";

import { useBoardStore } from "../model/board-store";
import { useUpdateBoard } from "../api/use-board-mutations";
import {
	createBoardSchema,
	automationTriggerEnum,
	automationActionEnum,
	type AutomationRule,
	type CreateBoardValues,
} from "../schemas/board-schemas";

const TRIGGER_LABELS: Record<string, string> = {
	card_enters_column: "Card enters column",
	card_assigned: "Card assigned",
	deliverable_submitted: "Deliverable submitted",
	sign_off_completed: "Sign-off completed",
};

const ACTION_LABELS: Record<string, string> = {
	notify_reviewer: "Notify reviewer",
	auto_assign: "Auto-assign agent",
	send_webhook: "Send webhook",
	change_status: "Change status",
};

interface BoardSettingsProps {
	boardId: string;
}

export function BoardSettings({ boardId }: BoardSettingsProps) {
	const board = useBoardStore((s) =>
		s.boards.find((b) => b.id === boardId),
	);
	const updateBoard = useUpdateBoard();

	// General form
	const form = useForm<CreateBoardValues>({
		// biome-ignore lint/suspicious/noExplicitAny: Zod v4 + exactOptionalPropertyTypes requires as any cast for zodResolver
		resolver: zodResolver(createBoardSchema as any),
		defaultValues: {
			name: board?.name ?? "",
		},
	});

	// Column management state
	const [columns, setColumns] = useState<BoardColumn[]>(
		() => board?.columns ?? [],
	);
	const [newColumnName, setNewColumnName] = useState("");
	const [newColumnPosition, setNewColumnPosition] = useState("");

	// Automation rules state
	const [rules, setRules] = useState<AutomationRule[]>([]);
	const [addingRule, setAddingRule] = useState(false);
	const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
		trigger: "card_enters_column",
		action: "notify_reviewer",
		actionConfig: {},
	});

	// -- General --
	const handleSaveName = useCallback(
		(values: CreateBoardValues) => {
			updateBoard.mutate({
				boardId,
				updates: { name: values.name },
			});
		},
		[boardId, updateBoard],
	);

	// -- Columns --
	const handleAddColumn = useCallback(() => {
		if (!newColumnName.trim()) return;

		// Determine position: insert after selected column or at end
		const insertAfterIdx = newColumnPosition
			? columns.findIndex((c) => c.id === newColumnPosition)
			: columns.length - 1;

		const newCol: BoardColumn = {
			id: `col-custom-${nanoid(6)}`,
			name: newColumnName.trim(),
			semanticRole: null,
			order: insertAfterIdx + 1,
			isHumanOnly: true,
		};

		const updated = [...columns];
		updated.splice(insertAfterIdx + 1, 0, newCol);
		// Reindex orders
		const reindexed = updated.map((c, i) => ({ ...c, order: i }));
		setColumns(reindexed);
		setNewColumnName("");
		setNewColumnPosition("");
		toast.success(`Column "${newCol.name}" added`);
	}, [newColumnName, newColumnPosition, columns]);

	const handleRemoveColumn = useCallback(
		(colId: string) => {
			const updated = columns
				.filter((c) => c.id !== colId)
				.map((c, i) => ({ ...c, order: i }));
			setColumns(updated);
		},
		[columns],
	);

	const handleSaveColumns = useCallback(() => {
		updateBoard.mutate({
			boardId,
			updates: { columns },
		});
	}, [boardId, columns, updateBoard]);

	// -- Automation Rules --
	const handleAddRule = useCallback(() => {
		if (!newRule.trigger || !newRule.action) return;
		const rule: AutomationRule = {
			id: `rule-${nanoid(6)}`,
			trigger: newRule.trigger as AutomationRule["trigger"],
			triggerColumn: newRule.triggerColumn,
			action: newRule.action as AutomationRule["action"],
			actionConfig: newRule.actionConfig ?? {},
		};
		setRules((prev) => [...prev, rule]);
		setAddingRule(false);
		setNewRule({
			trigger: "card_enters_column",
			action: "notify_reviewer",
			actionConfig: {},
		});
		toast.success("Automation rule added");
	}, [newRule]);

	const handleRemoveRule = useCallback((ruleId: string) => {
		setRules((prev) => prev.filter((r) => r.id !== ruleId));
	}, []);

	if (!board) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground">
				Board not found
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-2xl">
			{/* General Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Settings2 className="size-4" />
						General
					</CardTitle>
					<CardDescription>
						Basic board configuration
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={form.handleSubmit(handleSaveName)}
						className="flex items-end gap-3"
					>
						<div className="flex-1 space-y-1.5">
							<Label htmlFor="board-name">Board name</Label>
							<Input
								id="board-name"
								{...form.register("name")}
							/>
							{form.formState.errors.name && (
								<p className="text-xs text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>
						<Button type="submit" size="sm">
							Save
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Columns Management */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<GripVertical className="size-4" />
						Columns
					</CardTitle>
					<CardDescription>
						Core columns cannot be removed. You can add human-only
						columns between them.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Column list */}
					<div className="space-y-2">
						{columns.map((col) => (
							<div
								key={col.id}
								className={cn(
									"flex items-center gap-3 rounded-md border px-3 py-2",
									col.semanticRole
										? "bg-muted/30"
										: "bg-background",
								)}
							>
								<span className="flex-1 text-sm font-medium">
									{col.name}
								</span>
								{col.semanticRole ? (
									<div className="flex items-center gap-1.5">
										<Badge
											variant="secondary"
											className="text-[10px]"
										>
											{col.semanticRole}
										</Badge>
										<Lock className="size-3 text-muted-foreground" />
									</div>
								) : (
									<div className="flex items-center gap-1.5">
										<Badge
											variant="outline"
											className="text-[10px]"
										>
											human-only
										</Badge>
										<Button
											variant="ghost"
											size="icon"
											className="size-6"
											onClick={() =>
												handleRemoveColumn(col.id)
											}
										>
											<Trash2 className="size-3 text-destructive" />
											<span className="sr-only">
												Remove column
											</span>
										</Button>
									</div>
								)}
							</div>
						))}
					</div>

					{/* Add column form */}
					<Separator />
					<div className="space-y-3">
						<p className="text-xs font-medium text-muted-foreground">
							Add Human-Only Column
						</p>
						<div className="flex items-end gap-2">
							<div className="flex-1 space-y-1">
								<Label
									htmlFor="new-col-name"
									className="text-xs"
								>
									Name
								</Label>
								<Input
									id="new-col-name"
									placeholder="e.g. QA Testing"
									value={newColumnName}
									onChange={(e) =>
										setNewColumnName(e.target.value)
									}
									className="h-8 text-sm"
								/>
							</div>
							<div className="w-44 space-y-1">
								<Label
									htmlFor="col-position"
									className="text-xs"
								>
									Insert after
								</Label>
								<Select
									value={newColumnPosition}
									onValueChange={setNewColumnPosition}
								>
									<SelectTrigger className="h-8 text-sm">
										<SelectValue placeholder="End" />
									</SelectTrigger>
									<SelectContent>
										{columns.map((col) => (
											<SelectItem
												key={col.id}
												value={col.id}
											>
												After {col.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button
								size="sm"
								className="h-8"
								onClick={handleAddColumn}
								disabled={!newColumnName.trim()}
							>
								<Plus className="mr-1 size-3" />
								Add
							</Button>
						</div>
					</div>

					<div className="flex justify-end pt-2">
						<Button
							size="sm"
							variant="outline"
							onClick={handleSaveColumns}
						>
							Save Columns
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Automation Rules */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Zap className="size-4" />
						Automation Rules
					</CardTitle>
					<CardDescription>
						Automate actions when specific events occur on this
						board.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Existing rules */}
					{rules.length === 0 && !addingRule && (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No automation rules configured yet.
						</p>
					)}

					{rules.map((rule) => (
						<div
							key={rule.id}
							className="flex items-center gap-3 rounded-md border px-3 py-2"
						>
							<div className="flex-1 space-y-0.5">
								<p className="text-sm font-medium">
									When:{" "}
									{TRIGGER_LABELS[rule.trigger] ??
										rule.trigger}
									{rule.triggerColumn && (
										<span className="text-muted-foreground">
											{" "}
											({rule.triggerColumn})
										</span>
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									Then:{" "}
									{ACTION_LABELS[rule.action] ?? rule.action}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => handleRemoveRule(rule.id)}
							>
								<Trash2 className="size-3 text-destructive" />
								<span className="sr-only">Remove rule</span>
							</Button>
						</div>
					))}

					{/* Add rule form */}
					{addingRule && (
						<div className="space-y-3 rounded-md border p-3">
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1">
									<Label className="text-xs">Trigger</Label>
									<Select
										value={newRule.trigger ?? ""}
										onValueChange={(v) =>
											setNewRule((r) => ({
												...r,
												trigger:
													v as AutomationRule["trigger"],
											}))
										}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{automationTriggerEnum.options.map(
												(opt) => (
													<SelectItem
														key={opt}
														value={opt}
													>
														{TRIGGER_LABELS[opt] ??
															opt}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>

								{newRule.trigger === "card_enters_column" && (
									<div className="space-y-1">
										<Label className="text-xs">
											Column
										</Label>
										<Select
											value={
												newRule.triggerColumn ?? ""
											}
											onValueChange={(v) =>
												setNewRule((r) => ({
													...r,
													triggerColumn: v,
												}))
											}
										>
											<SelectTrigger className="h-8 text-sm">
												<SelectValue placeholder="Select column" />
											</SelectTrigger>
											<SelectContent>
												{columns.map((col) => (
													<SelectItem
														key={col.id}
														value={col.name}
													>
														{col.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								<div className="space-y-1">
									<Label className="text-xs">Action</Label>
									<Select
										value={newRule.action ?? ""}
										onValueChange={(v) =>
											setNewRule((r) => ({
												...r,
												action:
													v as AutomationRule["action"],
											}))
										}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{automationActionEnum.options.map(
												(opt) => (
													<SelectItem
														key={opt}
														value={opt}
													>
														{ACTION_LABELS[opt] ??
															opt}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>

								{newRule.action === "send_webhook" && (
									<div className="space-y-1 col-span-2">
										<Label className="text-xs">
											Webhook URL
										</Label>
										<Input
											placeholder="https://..."
											value={
												newRule.actionConfig
													?.webhookUrl ?? ""
											}
											onChange={(e) =>
												setNewRule((r) => ({
													...r,
													actionConfig: {
														...r.actionConfig,
														webhookUrl:
															e.target.value,
													},
												}))
											}
											className="h-8 text-sm"
										/>
									</div>
								)}
							</div>

							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => setAddingRule(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									className="h-7 text-xs"
									onClick={handleAddRule}
								>
									Add Rule
								</Button>
							</div>
						</div>
					)}

					{!addingRule && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setAddingRule(true)}
						>
							<Plus className="mr-1 size-3" />
							Add Rule
						</Button>
					)}
				</CardContent>
			</Card>

			{/* Members placeholder */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Users className="size-4" />
						Members
					</CardTitle>
					<CardDescription>
						Board access management coming soon
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center rounded-md border border-dashed p-8">
						<p className="text-sm text-muted-foreground">
							Team member management will be available in a future
							update.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
