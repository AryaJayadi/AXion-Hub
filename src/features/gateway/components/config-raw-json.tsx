"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { useConfigDraftStore } from "../model/config-draft-store";

/**
 * Full openclaw.json raw JSON editor with textarea.
 * Reads from draft store, debounced 500ms sync back on change.
 */
export function ConfigRawJson() {
	const draftConfig = useConfigDraftStore((s) => s.draftConfig);
	const updateFromRawJson = useConfigDraftStore((s) => s.updateFromRawJson);

	const [text, setText] = useState(() =>
		draftConfig ? JSON.stringify(draftConfig, null, 2) : "",
	);
	const [parseError, setParseError] = useState<string | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

	// Sync when draftConfig changes externally (e.g., form edits or reset)
	useEffect(() => {
		if (draftConfig) {
			setText(JSON.stringify(draftConfig, null, 2));
			setParseError(null);
		}
	}, [draftConfig]);

	const handleChange = useCallback(
		(value: string) => {
			setText(value);
			if (timerRef.current) clearTimeout(timerRef.current);

			timerRef.current = setTimeout(() => {
				const success = updateFromRawJson(value);
				if (!success) {
					setParseError("Invalid JSON -- please check your syntax");
				} else {
					setParseError(null);
				}
			}, 500);
		},
		[updateFromRawJson],
	);

	const handleFormat = useCallback(() => {
		try {
			const parsed = JSON.parse(text);
			const formatted = JSON.stringify(parsed, null, 2);
			setText(formatted);
			setParseError(null);
		} catch {
			setParseError("Cannot format -- invalid JSON");
		}
	}, [text]);

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Edit the full openclaw.json configuration
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleFormat}
				>
					Format JSON
				</Button>
			</div>
			<textarea
				value={text}
				onChange={(e) => handleChange(e.target.value)}
				className={`w-full rounded-md border bg-muted/30 p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring ${
					parseError
						? "border-destructive ring-1 ring-destructive/20"
						: "border-input"
				}`}
				style={{ minHeight: "60vh" }}
				spellCheck={false}
			/>
			{parseError && (
				<p className="text-xs text-destructive">{parseError}</p>
			)}
		</div>
	);
}
