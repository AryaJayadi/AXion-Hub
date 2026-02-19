"use client";

import { Badge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

import { useApprovals } from "@/features/approvals/api/use-approvals";
import { ApprovalInboxWithNavigation } from "@/features/approvals/components/approval-inbox";

export function ApprovalsListView() {
	const { data: approvals, isLoading } = useApprovals();

	const count = approvals?.length ?? 0;

	return (
		<div className="space-y-0">
			<PageHeader
				title="Approvals"
				description="Tasks awaiting your review"
				actions={
					count > 0 ? (
						<Badge variant="secondary">{count} pending</Badge>
					) : undefined
				}
			/>

			{isLoading ? (
				<SkeletonTable rows={5} columns={4} />
			) : (
				<ApprovalInboxWithNavigation items={approvals ?? []} />
			)}
		</div>
	);
}
