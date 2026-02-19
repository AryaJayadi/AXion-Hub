import type { Metadata } from "next";
import { WorkflowDetailView } from "@/views/workflows/workflow-detail-view";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
	params,
}: {
	params: Promise<{ workflowId: string }>;
}): Promise<Metadata> {
	const { workflowId } = await params;
	return {
		title: `Workflow ${workflowId} | AXion Hub`,
		description: "View, edit, and run a workflow",
	};
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function WorkflowDetailPage({
	params,
}: {
	params: Promise<{ workflowId: string }>;
}) {
	const { workflowId } = await params;
	return <WorkflowDetailView workflowId={workflowId} />;
}
