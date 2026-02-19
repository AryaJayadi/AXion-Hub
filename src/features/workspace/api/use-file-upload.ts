"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";

/** Upload target: shared workspace or a specific agent's directory */
export type UploadTarget =
	| { type: "shared" }
	| { type: "agent"; agentId: string; agentName: string };

/** Metadata returned for each uploaded file */
export interface UploadedFileMeta {
	name: string;
	size: number;
	path: string;
}

interface UploadParams {
	files: File[];
	target: UploadTarget;
}

/** Mock agents available as upload targets */
export const UPLOAD_TARGET_AGENTS = [
	{ id: "agent-002", name: "Scout" },
	{ id: "agent-001", name: "Atlas" },
	{ id: "agent-005", name: "Prism" },
	{ id: "agent-004", name: "Scribe" },
] as const;

async function uploadFiles(params: UploadParams): Promise<UploadedFileMeta[]> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const basePath =
		params.target.type === "shared"
			? "/workspace/shared"
			: `/workspace/${params.target.agentId}`;

	return params.files.map((file) => ({
		name: file.name,
		size: file.size,
		path: `${basePath}/${file.name}`,
	}));
}

/**
 * TanStack Query mutation for file upload.
 *
 * Simulates upload with 500ms delay, returns file metadata.
 * On success: invalidates workspace tree query and shows success toast.
 * On error: shows error toast.
 */
export function useFileUpload() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: uploadFiles,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspace.tree(),
			});
			toast.success(
				`${data.length} ${data.length === 1 ? "file" : "files"} uploaded successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Upload failed. Please try again.");
		},
	});
}
