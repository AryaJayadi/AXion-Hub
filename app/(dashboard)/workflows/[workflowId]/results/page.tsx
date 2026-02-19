import type { Metadata } from "next";
import { WorkflowResultsView } from "@/views/workflows/workflow-results-view";

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
		title: `Workflow ${workflowId} Results | AXion Hub`,
		description: "View past workflow execution results",
	};
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function WorkflowResultsPage({
	params,
}: {
	params: Promise<{ workflowId: string }>;
}) {
	const { workflowId } = await params;
	return <WorkflowResultsView workflowId={workflowId} />;
}
