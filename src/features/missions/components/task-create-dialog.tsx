"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	CalendarIcon,
	Check,
	ChevronsUpDown,
	Plus,
	Trash2,
	X,
} from "lucide-react";

import { useAgentStore } from "@/features/agents/model/agent-store";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";

import { useBoardStore } from "../model/board-store";
import { useCreateTask } from "../api/use-task-mutations";
import { taskFormSchema, type TaskFormValues } from "../schemas/task-schemas";

interface TaskCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TaskCreateDialog({
	open,
	onOpenChange,
}: TaskCreateDialogProps) {
	const activeBoardId = useBoardStore((s) => s.activeBoardId);
	const agents = useAgentStore((s) => s.agents);
	const createTask = useCreateTask();

	const form = useForm<TaskFormValues>({
		// biome-ignore lint/suspicious/noExplicitAny: Zod v4 + exactOptionalPropertyTypes requires as any cast for zodResolver
		resolver: zodResolver(taskFormSchema as any),
		defaultValues: {
			title: "",
			description: "",
			priority: "medium",
			assignedAgentIds: [],
			reviewerId: undefined,
			tags: [],
			subtasks: [],
			signOffRequired: false,
			boardId: activeBoardId ?? "",
		},
	});

	const subtasksField = useFieldArray({
		control: form.control,
		name: "subtasks",
	});

	// Tag input state
	const [tagInput, setTagInput] = useState("");
	const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);

	const selectedAgentIds = form.watch("assignedAgentIds") ?? [];
	const tags = form.watch("tags") ?? [];
	const dueDate = form.watch("dueDate");

	const handleAddTag = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				const trimmed = tagInput.trim();
				if (trimmed && !tags.includes(trimmed)) {
					form.setValue("tags", [...tags, trimmed]);
				}
				setTagInput("");
			}
		},
		[tagInput, tags, form],
	);

	const handleRemoveTag = useCallback(
		(tag: string) => {
			form.setValue(
				"tags",
				tags.filter((t) => t !== tag),
			);
		},
		[tags, form],
	);

	const toggleAgent = useCallback(
		(agentId: string) => {
			const current = form.getValues("assignedAgentIds") ?? [];
			if (current.includes(agentId)) {
				form.setValue(
					"assignedAgentIds",
					current.filter((id) => id !== agentId),
				);
			} else {
				form.setValue("assignedAgentIds", [...current, agentId]);
			}
		},
		[form],
	);

	const onSubmit = useCallback(
		async (values: TaskFormValues) => {
			await createTask.mutateAsync({
				...values,
				boardId: activeBoardId ?? "",
			});
			form.reset();
			setTagInput("");
			onOpenChange(false);
		},
		[createTask, activeBoardId, form, onOpenChange],
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Create New Task</DialogTitle>
					<DialogDescription>
						Add a task to the mission board. It will appear in the
						Inbox column.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="task-title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="task-title"
							placeholder="What needs to be done?"
							{...form.register("title")}
						/>
						{form.formState.errors.title && (
							<p className="text-xs text-destructive">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="task-description">Description</Label>
						<textarea
							id="task-description"
							placeholder="Describe the task in detail (supports markdown)..."
							rows={4}
							className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
							{...form.register("description")}
						/>
					</div>

					{/* Priority + Due Date row */}
					<div className="grid grid-cols-2 gap-4">
						{/* Priority */}
						<div className="space-y-2">
							<Label>Priority</Label>
							<Select
								value={form.watch("priority") ?? "medium"}
								onValueChange={(v) =>
									form.setValue(
										"priority",
										v as TaskFormValues["priority"],
									)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="critical">
										Critical
									</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">
										Medium
									</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Due Date */}
						<div className="space-y-2">
							<Label>Due Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!dueDate &&
												"text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 size-4" />
										{dueDate
											? format(dueDate, "PPP")
											: "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={dueDate}
										onSelect={(date) =>
											form.setValue("dueDate", date)
										}
										disabled={(date) =>
											date < new Date(
												new Date().setHours(0, 0, 0, 0),
											)
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Assigned Agents */}
					<div className="space-y-2">
						<Label>Assigned Agents</Label>
						<Popover
							open={agentPopoverOpen}
							onOpenChange={setAgentPopoverOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="w-full justify-between"
								>
									{selectedAgentIds.length > 0
										? `${selectedAgentIds.length} agent(s) selected`
										: "Select agents..."}
									<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0">
								<Command>
									<CommandInput placeholder="Search agents..." />
									<CommandList>
										<CommandEmpty>
											No agents found.
										</CommandEmpty>
										<CommandGroup>
											{agents.map((agent) => (
												<CommandItem
													key={agent.id}
													value={agent.name}
													onSelect={() =>
														toggleAgent(agent.id)
													}
												>
													<Checkbox
														checked={selectedAgentIds.includes(
															agent.id,
														)}
														className="mr-2"
													/>
													{agent.name}
													{selectedAgentIds.includes(
														agent.id,
													) && (
														<Check className="ml-auto size-4" />
													)}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{/* Selected agents as chips */}
						{selectedAgentIds.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{selectedAgentIds.map((agentId) => {
									const agent = agents.find(
										(a) => a.id === agentId,
									);
									return (
										<Badge
											key={agentId}
											variant="secondary"
											className="gap-1"
										>
											{agent?.name ?? agentId}
											<button
												type="button"
												onClick={() =>
													toggleAgent(agentId)
												}
												className="ml-0.5 rounded-full hover:bg-muted"
											>
												<X className="size-3" />
											</button>
										</Badge>
									);
								})}
							</div>
						)}
					</div>

					{/* Reviewer */}
					<div className="space-y-2">
						<Label htmlFor="task-reviewer">Reviewer</Label>
						<Input
							id="task-reviewer"
							placeholder="Reviewer ID or name"
							{...form.register("reviewerId")}
						/>
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label htmlFor="task-tags">Tags</Label>
						<Input
							id="task-tags"
							placeholder="Type a tag and press Enter"
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
						/>
						{tags.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{tags.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="gap-1"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="ml-0.5 rounded-full hover:bg-muted"
										>
											<X className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Subtasks */}
					<div className="space-y-2">
						<Label>Subtasks</Label>
						<div className="space-y-2">
							{subtasksField.fields.map((field, index) => (
								<div
									key={field.id}
									className="flex items-center gap-2"
								>
									<Input
										placeholder={`Subtask ${index + 1}`}
										{...form.register(
											`subtasks.${index}.title`,
										)}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() =>
											subtasksField.remove(index)
										}
									>
										<Trash2 className="size-4 text-muted-foreground" />
									</Button>
								</div>
							))}
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								subtasksField.append({ title: "" })
							}
						>
							<Plus className="mr-1.5 size-4" />
							Add Subtask
						</Button>
					</div>

					{/* Sign-off Required */}
					<div className="flex items-center gap-3">
						<Switch
							id="task-signoff"
							checked={form.watch("signOffRequired") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("signOffRequired", !!checked)
							}
						/>
						<Label htmlFor="task-signoff" className="cursor-pointer">
							Require human sign-off before DONE
						</Label>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createTask.isPending}
						>
							{createTask.isPending
								? "Creating..."
								: "Create Task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
