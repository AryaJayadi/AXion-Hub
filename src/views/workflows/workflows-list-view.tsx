"use client";

/**
 * Workflows list view at /workflows.
 *
 * Displays a card grid of saved workflows with trigger badges, status,
 * and a button to create new workflows.
 */

import Link from "next/link";
import { Workflow, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useWorkflows } from "@/features/workflows/api/use-workflows";
import { WorkflowCard } from "@/features/workflows/components/workflow-card";

export function WorkflowsListView() {
	const { workflows, isLoading } = useWorkflows();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Workflows"
				description="Build and manage automated multi-step workflows"
				actions={
					<Button asChild size="sm">
						<Link href="/workflows/new">
							<Plus className="mr-1.5 size-4" />
							New Workflow
						</Link>
					</Button>
				}
			/>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-36 rounded-lg" />
					<Skeleton className="h-36 rounded-lg" />
					<Skeleton className="h-36 rounded-lg" />
					<Skeleton className="h-36 rounded-lg" />
					<Skeleton className="h-36 rounded-lg" />
					<Skeleton className="h-36 rounded-lg" />
				</div>
			)}

			{/* Empty state */}
			{!isLoading && workflows.length === 0 && (
				<div className="flex flex-col items-center justify-center gap-3 py-16">
					<Workflow className="size-12 text-muted-foreground" />
					<p className="text-muted-foreground">
						No workflows yet. Create your first workflow to get
						started.
					</p>
					<Button asChild size="sm">
						<Link href="/workflows/new">
							<Plus className="mr-1.5 size-4" />
							Create Workflow
						</Link>
					</Button>
				</div>
			)}

			{/* Workflow grid */}
			{!isLoading && workflows.length > 0 && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{workflows.map((workflow) => (
						<WorkflowCard key={workflow.id} workflow={workflow} />
					))}
				</div>
			)}
		</div>
	);
}
