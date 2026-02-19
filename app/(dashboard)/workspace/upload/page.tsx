import { Suspense } from "react";
import { UploadView } from "@/views/workspace/upload-view";

export const metadata = {
	title: "Upload Files | AXion Hub",
};

export default function WorkspaceUploadPage() {
	return (
		<Suspense>
			<UploadView />
		</Suspense>
	);
}
