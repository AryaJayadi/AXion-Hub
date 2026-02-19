"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PageHeader } from "@/shared/ui/page-header";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import { useCronSchedules, useCreateCronSchedule } from "@/features/workflows/api/use-cron-schedules";
import { useWorkflows } from "@/features/workflows/api/use-workflows";
import { CronBuilder } from "@/features/workflows/components/cron-builder";
import { CronSchedulesTable } from "@/features/workflows/components/cron-schedules-table";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CronSchedulesView() {
	const { schedules, isLoading } = useCronSchedules();
	const { workflows } = useWorkflows();
	const createMutation = useCreateCronSchedule();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [formName, setFormName] = useState("");
	const [formWorkflowId, setFormWorkflowId] = useState("");
	const [formExpression, setFormExpression] = useState("0 0 * * *");

	const resetForm = useCallback(() => {
		setFormName("");
		setFormWorkflowId("");
		setFormExpression("0 0 * * *");
	}, []);

	const handleCreate = useCallback(() => {
		if (!formName || !formWorkflowId) return;
		createMutation.mutate(
			{
				name: formName,
				workflowId: formWorkflowId,
				expression: formExpression,
			},
			{
				onSuccess: () => {
					setDialogOpen(false);
					resetForm();
				},
			},
		);
	}, [formName, formWorkflowId, formExpression, createMutation, resetForm]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setDialogOpen(open);
			if (!open) resetForm();
		},
		[resetForm],
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Cron Schedules"
				description="Schedule recurring workflow executions"
				breadcrumbs={[
					{ label: "Workflows", href: "/workflows" },
					{ label: "Cron Schedules" },
				]}
				actions={
					<Button onClick={() => setDialogOpen(true)}>
						<Plus className="mr-2 size-4" />
						New Schedule
					</Button>
				}
			/>

			<CronSchedulesTable schedules={schedules} {...(isLoading ? { isLoading } : {})} />

			{/* Create Schedule Dialog */}
			<Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>New Cron Schedule</DialogTitle>
						<DialogDescription>
							Create a recurring schedule to run a workflow automatically.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{/* Name */}
						<div className="space-y-1.5">
							<Label htmlFor="cron-name">Name</Label>
							<Input
								id="cron-name"
								placeholder="e.g. Daily Report"
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
							/>
						</div>

						{/* Workflow select */}
						<div className="space-y-1.5">
							<Label>Workflow</Label>
							<Select
								value={formWorkflowId}
								onValueChange={setFormWorkflowId}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a workflow" />
								</SelectTrigger>
								<SelectContent>
									{workflows.map((wf) => (
										<SelectItem key={wf.id} value={wf.id}>
											{wf.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Cron builder */}
						<CronBuilder
							value={formExpression}
							onChange={setFormExpression}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreate}
							disabled={
								!formName ||
								!formWorkflowId ||
								createMutation.isPending
							}
						>
							{createMutation.isPending ? "Creating..." : "Create Schedule"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
