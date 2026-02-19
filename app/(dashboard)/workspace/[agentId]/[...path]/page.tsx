import { Suspense } from "react";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { WorkspaceFileView } from "@/views/workspace/workspace-file-view";

export const metadata = {
	title: "File Editor | AXion Hub",
};

interface WorkspaceFilePageProps {
	params: Promise<{
		agentId: string;
		path: string[];
	}>;
}

export default async function WorkspaceFilePage({
	params,
}: WorkspaceFilePageProps) {
	const { agentId, path } = await params;

	return (
		<Suspense fallback={<SkeletonDetail />}>
			<WorkspaceFileView agentId={agentId} path={path} />
		</Suspense>
	);
}
