import { Suspense } from "react";
import { ApprovalDetailView } from "@/views/approvals/approval-detail-view";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ taskId: string }>;
}) {
	const { taskId } = await params;
	return {
		title: `Approval ${taskId} | AXion Hub`,
	};
}

export default async function ApprovalDetailPage({
	params,
}: {
	params: Promise<{ taskId: string }>;
}) {
	const { taskId } = await params;

	return (
		<Suspense>
			<ApprovalDetailView taskId={taskId} />
		</Suspense>
	);
}
