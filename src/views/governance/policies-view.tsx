"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { PolicyRule, PolicyRuleInput } from "@/entities/governance";
import { usePolicies } from "@/features/governance/api/use-policies";
import {
	useCreatePolicy,
	useUpdatePolicy,
	useDeletePolicy,
	useTogglePolicy,
} from "@/features/governance/api/use-policy-mutations";
import { ConditionBuilder } from "@/features/governance/components/condition-builder";
import { PolicyList } from "@/features/governance/components/policy-list";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/shared/ui/sheet";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export function PoliciesView() {
	const { data: policies, isLoading } = usePolicies();
	const createPolicy = useCreatePolicy();
	const updatePolicy = useUpdatePolicy();
	const deletePolicy = useDeletePolicy();
	const togglePolicy = useTogglePolicy();

	const [sheetOpen, setSheetOpen] = useState(false);
	const [editingPolicy, setEditingPolicy] = useState<PolicyRule | undefined>(
		undefined,
	);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	function handleCreate() {
		setEditingPolicy(undefined);
		setSheetOpen(true);
	}

	function handleEdit(policy: PolicyRule) {
		setEditingPolicy(policy);
		setSheetOpen(true);
	}

	function handleDelete(id: string) {
		setDeletingId(id);
	}

	function handleToggle(id: string, enabled: boolean) {
		togglePolicy.mutate({ id, enabled });
	}

	function handleSubmit(data: PolicyRuleInput) {
		if (editingPolicy) {
			updatePolicy.mutate(
				{ id: editingPolicy.id, data },
				{
					onSuccess: () => {
						setSheetOpen(false);
						setEditingPolicy(undefined);
					},
				},
			);
		} else {
			createPolicy.mutate(data, {
				onSuccess: () => {
					setSheetOpen(false);
				},
			});
		}
	}

	function handleConfirmDelete() {
		if (deletingId) {
			deletePolicy.mutate(deletingId);
			setDeletingId(null);
		}
	}

	const deletingPolicy = policies?.find((p) => p.id === deletingId);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Governance Policies"
				description="Define rules that govern agent behavior"
				actions={
					<Button size="sm" onClick={handleCreate}>
						<Plus className="mr-1 size-4" />
						Create Policy
					</Button>
				}
			/>

			{/* Loading skeleton */}
			{isLoading && (
				<div className="space-y-4">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			)}

			{/* Policy list */}
			{!isLoading && policies && (
				<PolicyList
					policies={policies}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onToggle={handleToggle}
					onCreateFirst={handleCreate}
				/>
			)}

			{/* Create/Edit Sheet */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
					<SheetHeader>
						<SheetTitle>
							{editingPolicy ? "Edit Policy" : "Create Policy"}
						</SheetTitle>
						<SheetDescription>
							{editingPolicy
								? "Modify the conditions and action for this governance rule."
								: "Define a new IF/THEN rule to govern agent behavior."}
						</SheetDescription>
					</SheetHeader>
					<div className="px-4 pb-4">
						<ConditionBuilder
							editPolicy={editingPolicy}
							onSubmit={handleSubmit}
							onCancel={() => {
								setSheetOpen(false);
								setEditingPolicy(undefined);
							}}
							isPending={
								createPolicy.isPending || updatePolicy.isPending
							}
						/>
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={deletingId !== null}
				onOpenChange={(open) => {
					if (!open) setDeletingId(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Policy</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium">
								{deletingPolicy?.name ?? "this policy"}
							</span>
							? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
