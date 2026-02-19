"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { UploadDialog } from "@/features/workspace/components/upload-dialog";

export function UploadView() {
	const [uploadSuccess, setUploadSuccess] = useState(false);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Upload Files"
				description="Upload files to agent workspace"
				breadcrumbs={[
					{ label: "Workspace", href: "/workspace" },
					{ label: "Upload" },
				]}
			/>

			{/* Upload content */}
			<div className="mx-auto max-w-2xl">
				<UploadDialog
					onUploadSuccess={() => setUploadSuccess(true)}
				/>

				{/* Success state */}
				{uploadSuccess && (
					<div className="mt-6 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
						<CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
						<div className="flex-1">
							<p className="text-sm font-medium text-green-800 dark:text-green-200">
								Files uploaded successfully
							</p>
							<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
								Your files are now available in the workspace.
							</p>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link href="/workspace">View in workspace</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
