"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { FormField } from "@/shared/ui/form-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import type { AlertRule } from "../model/alert-schema";

// ---------------------------------------------------------------------------
// Zod schema for alert rule form
// ---------------------------------------------------------------------------
const alertRuleFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	description: z.string().max(1000).optional(),
	metric: z.string().min(1, "Metric is required"),
	operator: z.string().min(1, "Operator is required"),
	threshold: z.coerce.number().min(0, "Threshold must be >= 0"),
	duration: z.coerce.number().min(0, "Duration must be >= 0"),
	severity: z.enum(["critical", "warning", "info"]),
	webhookUrl: z
		.union([z.literal(""), z.string().url("Must be a valid URL")])
		.optional(),
	enabled: z.boolean(),
});

type AlertRuleFormValues = z.infer<typeof alertRuleFormSchema>;

const METRIC_OPTIONS = [
	{ value: "agent.status", label: "Agent Status" },
	{ value: "error.rate", label: "Error Rate" },
	{ value: "agent.context_usage", label: "Context Usage" },
	{ value: "gateway.status", label: "Gateway Status" },
	{ value: "cost.hourly", label: "Hourly Cost" },
	{ value: "task.duration", label: "Task Duration" },
];

const OPERATOR_OPTIONS = [
	{ value: ">", label: "> (greater than)" },
	{ value: "<", label: "< (less than)" },
	{ value: "==", label: "== (equals)" },
	{ value: "!=", label: "!= (not equals)" },
];

const SEVERITY_OPTIONS = [
	{ value: "critical", label: "Critical" },
	{ value: "warning", label: "Warning" },
	{ value: "info", label: "Info" },
];

interface AlertRuleFormProps {
	initialValues?: Partial<AlertRule> | undefined;
	onSubmit: (data: AlertRuleFormValues) => void;
	onCancel: () => void;
}

export function AlertRuleForm({
	initialValues,
	onSubmit,
	onCancel,
}: AlertRuleFormProps) {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
		// zodResolver requires as-any cast with Zod v4 + exactOptionalPropertyTypes
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} = useForm<AlertRuleFormValues>({
		resolver: zodResolver(alertRuleFormSchema) as any,
		defaultValues: {
			name: initialValues?.name ?? "",
			description: initialValues?.description ?? "",
			metric: initialValues?.metric ?? "",
			operator: initialValues?.operator ?? ">",
			threshold: initialValues?.threshold ?? 0,
			duration: initialValues?.duration ?? 0,
			severity: (initialValues?.severity as "critical" | "warning" | "info") ?? "warning",
			webhookUrl: initialValues?.webhookUrl ?? "",
			enabled: initialValues?.enabled ?? true,
		},
	});

	const enabledValue = watch("enabled");

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<FormField label="Name" required error={errors.name?.message}>
				<Input placeholder="My alert rule" {...register("name")} />
			</FormField>

			<FormField label="Description" error={errors.description?.message}>
				<Textarea
					placeholder="Describe what this alert monitors..."
					rows={2}
					{...register("description")}
				/>
			</FormField>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField label="Metric" required error={errors.metric?.message}>
					<Select
						value={watch("metric")}
						onValueChange={(v) => setValue("metric", v)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select metric" />
						</SelectTrigger>
						<SelectContent>
							{METRIC_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>

				<FormField label="Operator" required error={errors.operator?.message}>
					<Select
						value={watch("operator")}
						onValueChange={(v) => setValue("operator", v)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select operator" />
						</SelectTrigger>
						<SelectContent>
							{OPERATOR_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					label="Threshold"
					required
					error={errors.threshold?.message}
				>
					<Input
						type="number"
						min={0}
						placeholder="0"
						{...register("threshold")}
					/>
				</FormField>

				<FormField
					label="Duration (seconds)"
					description="0 for instant alerts"
					error={errors.duration?.message}
				>
					<Input
						type="number"
						min={0}
						placeholder="0"
						{...register("duration")}
					/>
				</FormField>
			</div>

			<FormField label="Severity" required error={errors.severity?.message}>
				<Select
					value={watch("severity")}
					onValueChange={(v) =>
						setValue("severity", v as "critical" | "warning" | "info")
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select severity" />
					</SelectTrigger>
					<SelectContent>
						{SEVERITY_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Webhook URL"
				description="Sends JSON POST to this URL on alert"
				error={errors.webhookUrl?.message}
			>
				<Input
					type="url"
					placeholder="https://hooks.example.com/webhook"
					{...register("webhookUrl")}
				/>
			</FormField>

			<FormField label="Enabled">
				<div className="flex items-center gap-2 pt-1">
					<Switch
						checked={enabledValue}
						onCheckedChange={(v) => setValue("enabled", v)}
					/>
					<span className="text-sm text-muted-foreground">
						{enabledValue ? "Active" : "Disabled"}
					</span>
				</div>
			</FormField>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{initialValues?.id ? "Update Rule" : "Create Rule"}
				</Button>
			</div>
		</form>
	);
}

export type { AlertRuleFormValues };
