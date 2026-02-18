"use client";

import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
	MoreHorizontal,
	Plus,
	Pencil,
	Trash2,
	ArrowLeft,
	AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/shared/ui/page-header";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/shared/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { AlertTemplatePicker } from "@/features/dashboard/components/alert-template-picker";
import { AlertRuleForm } from "@/features/dashboard/components/alert-rule-form";
import type { AlertRuleFormValues } from "@/features/dashboard/components/alert-rule-form";
import type { AlertTemplate } from "@/features/dashboard/lib/alert-templates";
import type { AlertRule } from "@/features/dashboard/model/alert-schema";
import {
	useAlertRules,
	useCreateAlertRule,
	useUpdateAlertRule,
	useDeleteAlertRule,
} from "@/features/dashboard/api/use-alert-rules";

// ---------------------------------------------------------------------------
// Severity badge variant mapping
// ---------------------------------------------------------------------------
const SEVERITY_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	critical: "destructive",
	warning: "default",
	info: "secondary",
};

// ---------------------------------------------------------------------------
// Dialog step type
// ---------------------------------------------------------------------------
type DialogStep = "closed" | "pick-template" | "form";

export function MonitorAlertsView() {
	const { data: rules, isLoading } = useAlertRules();
	const createMutation = useCreateAlertRule();
	const updateMutation = useUpdateAlertRule();
	const deleteMutation = useDeleteAlertRule();

	const [dialogStep, setDialogStep] = useState<DialogStep>("closed");
	const [selectedTemplate, setSelectedTemplate] =
		useState<AlertTemplate | null>(null);
	const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	// Handle template selection -> advance to form
	function handleTemplateSelect(template: AlertTemplate) {
		setSelectedTemplate(template);
		setDialogStep("form");
	}

	// Handle "skip template" -> go straight to form
	function handleSkipTemplate() {
		setSelectedTemplate(null);
		setDialogStep("form");
	}

	// Handle form submit (create or edit)
	function handleFormSubmit(data: AlertRuleFormValues) {
		// Convert undefined to null for exactOptionalPropertyTypes compat
		const normalized = {
			name: data.name,
			metric: data.metric,
			operator: data.operator,
			threshold: data.threshold,
			duration: data.duration,
			severity: data.severity,
			enabled: data.enabled,
			description: data.description ?? null,
			webhookUrl: data.webhookUrl || null,
		};

		if (editingRule) {
			updateMutation.mutate(
				{ id: editingRule.id, ...normalized },
				{ onSuccess: () => closeDialog() },
			);
		} else {
			createMutation.mutate(
				{
					...normalized,
					templateId: selectedTemplate?.id,
				},
				{ onSuccess: () => closeDialog() },
			);
		}
	}

	function closeDialog() {
		setDialogStep("closed");
		setSelectedTemplate(null);
		setEditingRule(null);
	}

	function handleEdit(rule: AlertRule) {
		setEditingRule(rule);
		setDialogStep("form");
	}

	function handleDelete(ruleId: string) {
		deleteMutation.mutate(ruleId, {
			onSuccess: () => setDeleteConfirmId(null),
		});
	}

	// Toggle enabled/disabled inline
	function handleToggleEnabled(rule: AlertRule) {
		updateMutation.mutate({ id: rule.id, enabled: !rule.enabled });
	}

	// Table columns
	const columns = useMemo<ColumnDef<AlertRule, unknown>[]>(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "metric",
				header: "Metric",
				cell: ({ row }) => (
					<code className="rounded bg-muted px-1.5 py-0.5 text-xs">
						{row.original.metric}
					</code>
				),
			},
			{
				id: "threshold",
				header: "Condition",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.operator} {row.original.threshold}
						{row.original.duration > 0 && (
							<span className="ml-1">
								for {row.original.duration}s
							</span>
						)}
					</span>
				),
			},
			{
				accessorKey: "severity",
				header: "Severity",
				cell: ({ row }) => {
					const severity = row.original.severity;
					return (
						<Badge variant={SEVERITY_VARIANT[severity] ?? "secondary"}>
							{severity}
						</Badge>
					);
				},
			},
			{
				accessorKey: "enabled",
				header: "Enabled",
				cell: ({ row }) => (
					<Switch
						checked={row.original.enabled}
						onCheckedChange={() => handleToggleEnabled(row.original)}
					/>
				),
			},
			{
				id: "webhook",
				header: "Webhook",
				cell: ({ row }) => {
					const url = row.original.webhookUrl;
					if (!url) {
						return (
							<span className="text-xs text-muted-foreground">None</span>
						);
					}
					return (
						<span
							className="max-w-[150px] truncate text-xs text-muted-foreground"
							title={url}
						>
							{url}
						</span>
					);
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8">
								<MoreHorizontal className="size-4" />
								<span className="sr-only">Actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleEdit(row.original)}>
								<Pencil className="mr-2 size-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => setDeleteConfirmId(row.original.id)}
							>
								<Trash2 className="mr-2 size-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[],
	);

	// Initial values for form (either from editing rule or from template)
	const formInitialValues: Partial<AlertRule> | undefined = editingRule
		? editingRule
		: selectedTemplate
			? {
					name: selectedTemplate.name,
					description: selectedTemplate.description,
					metric: selectedTemplate.condition.metric,
					operator: selectedTemplate.condition.operator,
					threshold: selectedTemplate.condition.threshold,
					duration: selectedTemplate.condition.duration,
					severity: selectedTemplate.severity,
					enabled: true,
				}
			: undefined;

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Alert Rules"
				description="Configure alert rules and notification preferences"
				breadcrumbs={[
					{ label: "Monitor", href: "/monitor" },
					{ label: "Alert Rules" },
				]}
				actions={
					<Button
						size="sm"
						onClick={() => {
							setEditingRule(null);
							setSelectedTemplate(null);
							setDialogStep("pick-template");
						}}
					>
						<Plus className="mr-1.5 size-4" />
						Create Rule
					</Button>
				}
			/>

			<DataTable
				columns={columns}
				data={rules ?? []}
				isLoading={isLoading}
				searchKey="name"
				searchPlaceholder="Search rules..."
				enablePagination
				pageSize={10}
				emptyState={
					<div className="flex flex-col items-center gap-3 py-12 text-center">
						<AlertTriangle className="size-10 text-muted-foreground/50" />
						<div>
							<p className="font-medium">No alert rules configured</p>
							<p className="text-sm text-muted-foreground">
								Create your first alert rule from a template or from scratch.
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setDialogStep("pick-template")}
						>
							<Plus className="mr-1.5 size-4" />
							Create Rule
						</Button>
					</div>
				}
			/>

			{/* Create/Edit Dialog */}
			<Dialog
				open={dialogStep !== "closed"}
				onOpenChange={(open) => {
					if (!open) closeDialog();
				}}
			>
				<DialogContent className="max-w-2xl">
					{dialogStep === "pick-template" && (
						<>
							<DialogHeader>
								<DialogTitle>Create Alert Rule</DialogTitle>
								<DialogDescription>
									Choose a template to get started quickly, or create a rule
									from scratch.
								</DialogDescription>
							</DialogHeader>
							<AlertTemplatePicker onSelect={handleTemplateSelect} />
							<div className="flex justify-end pt-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleSkipTemplate}
								>
									Skip template -- create from scratch
								</Button>
							</div>
						</>
					)}

					{dialogStep === "form" && (
						<>
							<DialogHeader>
								<DialogTitle>
									{editingRule
										? `Edit: ${editingRule.name}`
										: selectedTemplate
											? `New Rule: ${selectedTemplate.name}`
											: "New Alert Rule"}
								</DialogTitle>
								<DialogDescription>
									{editingRule
										? "Update alert rule configuration."
										: "Configure the alert condition and notification settings."}
								</DialogDescription>
							</DialogHeader>
							{!editingRule && selectedTemplate && (
								<Button
									variant="ghost"
									size="sm"
									className="mb-2 w-fit"
									onClick={() => {
										setSelectedTemplate(null);
										setDialogStep("pick-template");
									}}
								>
									<ArrowLeft className="mr-1.5 size-3" />
									Back to templates
								</Button>
							)}
							<AlertRuleForm
								initialValues={formInitialValues}
								onSubmit={handleFormSubmit}
								onCancel={closeDialog}
							/>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmId !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteConfirmId(null);
				}}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete Alert Rule</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this alert rule? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							variant="outline"
							onClick={() => setDeleteConfirmId(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (deleteConfirmId) handleDelete(deleteConfirmId);
							}}
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
