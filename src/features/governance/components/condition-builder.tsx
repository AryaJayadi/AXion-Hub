"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import {
	type PolicyRule,
	type PolicyRuleInput,
	CONDITION_FIELD_LABELS,
	OPERATOR_LABELS,
	ACTION_LABELS,
	policyRuleSchema,
} from "@/entities/governance";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

interface ConditionBuilderProps {
	/** Existing policy to edit, or undefined for create mode */
	editPolicy?: PolicyRule | undefined;
	/** Called on successful form submission */
	onSubmit: (data: PolicyRuleInput) => void;
	/** Called when user cancels */
	onCancel: () => void;
	/** Whether the mutation is in progress */
	isPending?: boolean | undefined;
}

const FIELD_OPTIONS = Object.entries(CONDITION_FIELD_LABELS) as [
	string,
	string,
][];
const OPERATOR_OPTIONS = Object.entries(OPERATOR_LABELS) as [
	string,
	string,
][];
const ACTION_OPTIONS = Object.entries(ACTION_LABELS) as [string, string][];

export function ConditionBuilder({
	editPolicy,
	onSubmit,
	onCancel,
	isPending = false,
}: ConditionBuilderProps) {
	const isEditMode = !!editPolicy;

	const form = useForm<PolicyRuleInput>({
		resolver: zodResolver(policyRuleSchema) as never,
		defaultValues: editPolicy
			? {
					name: editPolicy.name,
					description: editPolicy.description ?? "",
					conditions: editPolicy.conditions,
					action: editPolicy.action,
					enabled: editPolicy.enabled,
				}
			: {
					name: "",
					description: "",
					conditions: [
						{ field: "task_priority", operator: "equals", value: "" },
					],
					action: "require_approval",
					enabled: true,
				},
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "conditions",
	});

	const watchedAction = watch("action");
	const watchedEnabled = watch("enabled");

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 p-1"
		>
			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor="policy-name">Name</Label>
				<Input
					id="policy-name"
					placeholder="e.g. Require approval for high-priority tasks"
					{...register("name")}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">
						{errors.name.message}
					</p>
				)}
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="policy-description">
					Description{" "}
					<span className="text-muted-foreground">(optional)</span>
				</Label>
				<Textarea
					id="policy-description"
					placeholder="Explain what this policy does and why..."
					rows={3}
					{...register("description")}
				/>
				{errors.description && (
					<p className="text-xs text-destructive">
						{errors.description.message}
					</p>
				)}
			</div>

			{/* Conditions */}
			<div className="space-y-3">
				<Label>Conditions</Label>
				{fields.map((field, index) => (
					<div
						key={field.id}
						className="flex flex-wrap items-start gap-2"
					>
						{index > 0 && (
							<span className="flex h-9 items-center text-xs font-medium text-muted-foreground">
								AND
							</span>
						)}
						{index === 0 && (
							<span className="flex h-9 items-center text-xs font-medium text-muted-foreground w-8">
								IF
							</span>
						)}

						{/* Field select */}
						<div className="min-w-[130px]">
							<Select
								value={watch(`conditions.${index}.field`)}
								onValueChange={(v) =>
									setValue(
										`conditions.${index}.field` as const,
										v as PolicyRuleInput["conditions"][number]["field"],
									)
								}
							>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Field" />
								</SelectTrigger>
								<SelectContent>
									{FIELD_OPTIONS.map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.conditions?.[index]?.field && (
								<p className="mt-1 text-xs text-destructive">
									{errors.conditions[index].field?.message}
								</p>
							)}
						</div>

						{/* Operator select */}
						<div className="min-w-[140px]">
							<Select
								value={watch(`conditions.${index}.operator`)}
								onValueChange={(v) =>
									setValue(
										`conditions.${index}.operator` as const,
										v as PolicyRuleInput["conditions"][number]["operator"],
									)
								}
							>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Operator" />
								</SelectTrigger>
								<SelectContent>
									{OPERATOR_OPTIONS.map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.conditions?.[index]?.operator && (
								<p className="mt-1 text-xs text-destructive">
									{errors.conditions[index].operator?.message}
								</p>
							)}
						</div>

						{/* Value input */}
						<div className="min-w-[120px] flex-1">
							<Input
								placeholder="Value"
								className="h-9 text-xs"
								{...register(`conditions.${index}.value`)}
							/>
							{errors.conditions?.[index]?.value && (
								<p className="mt-1 text-xs text-destructive">
									{errors.conditions[index].value?.message}
								</p>
							)}
						</div>

						{/* Remove button */}
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-9 shrink-0"
							disabled={fields.length <= 1}
							onClick={() => remove(index)}
						>
							<Trash2 className="size-4" />
							<span className="sr-only">Remove condition</span>
						</Button>
					</div>
				))}

				{errors.conditions?.root && (
					<p className="text-xs text-destructive">
						{errors.conditions.root.message}
					</p>
				)}

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() =>
						append({
							field: "task_priority",
							operator: "equals",
							value: "",
						})
					}
				>
					<Plus className="mr-1 size-3.5" />
					Add condition
				</Button>
			</div>

			{/* Action */}
			<div className="space-y-2">
				<Label>Then</Label>
				<Select
					value={watchedAction}
					onValueChange={(v) =>
						setValue("action", v as PolicyRuleInput["action"])
					}
				>
					<SelectTrigger className="h-9 text-xs">
						<SelectValue placeholder="Action" />
					</SelectTrigger>
					<SelectContent>
						{ACTION_OPTIONS.map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.action && (
					<p className="text-xs text-destructive">
						{errors.action.message}
					</p>
				)}
			</div>

			{/* Enabled toggle */}
			<div className="flex items-center gap-3">
				<Switch
					checked={watchedEnabled}
					onCheckedChange={(checked) => setValue("enabled", checked)}
				/>
				<Label className="text-sm">
					{watchedEnabled ? "Enabled" : "Disabled"}
				</Label>
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending
						? "Saving..."
						: isEditMode
							? "Update Policy"
							: "Create Policy"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
