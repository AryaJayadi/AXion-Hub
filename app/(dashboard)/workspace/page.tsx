import { Suspense } from "react";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { WorkspaceBrowserView } from "@/views/workspace/workspace-browser-view";

export const metadata = {
	title: "Workspace | AXion Hub",
};

export default function WorkspacePage() {
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<WorkspaceBrowserView />
		</Suspense>
	);
}
