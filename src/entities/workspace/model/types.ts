/**
 * Workspace file entity types.
 *
 * Represents files in agent workspace directories -- both shared workspace
 * and per-agent directories. Used by the workspace browser tree sidebar,
 * file viewer, and upload features.
 */

/** A node in the workspace file tree (file or directory). */
export interface FileTreeNode {
	/** File or directory name */
	name: string;
	/** Relative path from workspace root */
	path: string;
	/** Whether this node is a file or directory */
	type: "file" | "directory";
	/** Child nodes (only for directories) */
	children: FileTreeNode[] | undefined;
	/** File size in bytes */
	size: number | undefined;
	/** Last modification date */
	lastModified: Date | undefined;
	/** MIME type of the file */
	mimeType: string | undefined;
}

/** A workspace file with content loaded for viewing/editing. */
export interface WorkspaceFile {
	/** Relative path from workspace root */
	path: string;
	/** Agent ID that owns this file, null for shared workspace */
	agentId: string | null;
	/** File content as string */
	content: string;
	/** Detected language from file extension */
	language: string;
	/** File size in bytes */
	size: number;
	/** Last modification date */
	lastModified: Date;
	/** Whether the file is read-only */
	isReadOnly: boolean;
}

/** Upload target -- discriminated union for where to upload files. */
export type UploadTarget =
	| { type: "shared" }
	| { type: "agent"; agentId: string }
	| { type: "task"; taskId: string };
