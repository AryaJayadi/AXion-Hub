/**
 * Media upload utility functions for chat attachments.
 *
 * Handles file validation (type + size), attachment creation
 * from File objects, and object URL lifecycle management.
 */

import { nanoid } from "nanoid";
import type { Attachment, AttachmentType } from "@/entities/chat-message";

/** Accepted MIME types grouped by attachment category */
export const ACCEPTED_TYPES = {
	image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
	document: [
		"application/pdf",
		"text/plain",
		"text/markdown",
		"application/json",
	],
	audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
} as const;

/** Flat array of all accepted MIME types */
export const ALL_ACCEPTED_MIME_TYPES: string[] = [
	...ACCEPTED_TYPES.image,
	...ACCEPTED_TYPES.document,
	...ACCEPTED_TYPES.audio,
];

/** Maximum file size: 25MB */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Determine the attachment category for a MIME type.
 * Returns null if the type is not accepted.
 */
export function getAttachmentType(
	mimeType: string,
): AttachmentType | null {
	for (const [type, mimes] of Object.entries(ACCEPTED_TYPES)) {
		if ((mimes as readonly string[]).includes(mimeType)) {
			return type as AttachmentType;
		}
	}
	return null;
}

/**
 * Validate a file for upload.
 * Checks MIME type against accepted types and size against MAX_FILE_SIZE.
 */
export function validateFile(
	file: File,
): { valid: boolean; error?: string | undefined } {
	const attachmentType = getAttachmentType(file.type);
	if (!attachmentType) {
		return {
			valid: false,
			error: `Unsupported file type: ${file.type || "unknown"}. Accepted types: images, documents, audio.`,
		};
	}

	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 25MB.`,
		};
	}

	return { valid: true };
}

/**
 * Create an Attachment object from a File.
 * Generates a nanoid, extracts metadata, and creates an object URL for preview.
 */
export function createAttachmentFromFile(file: File): Attachment {
	const attachmentType = getAttachmentType(file.type);
	if (!attachmentType) {
		throw new Error(`Unsupported file type: ${file.type}`);
	}

	return {
		id: nanoid(),
		type: attachmentType,
		name: file.name,
		url: URL.createObjectURL(file),
		mimeType: file.type,
		size: file.size,
	};
}

/**
 * Upload a file and return its permanent URL.
 *
 * TODO: This is a placeholder that returns the object URL.
 * In production, this should POST to the gateway upload endpoint
 * and return the permanent URL. The gateway upload protocol
 * needs validation before implementing.
 */
export async function uploadFile(file: File): Promise<string> {
	return URL.createObjectURL(file);
}

/**
 * Revoke an object URL to free memory.
 * Should be called when an attachment is removed or after send.
 */
export function revokeAttachmentUrl(url: string): void {
	try {
		URL.revokeObjectURL(url);
	} catch {
		// Silently ignore if URL is not a valid object URL
	}
}
