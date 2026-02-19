"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Send, AlertCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Card, CardContent } from "@/shared/ui/card";
import { usePlaygroundStore } from "../model/playground-store";
import type { PlaygroundConnection } from "../lib/playground-ws-manager";
import { ConnectionPanel } from "./connection-panel";
import { EventTemplatePicker } from "./event-template-picker";
import { EventLog } from "./event-log";

/**
 * Dynamic import of CodeMirror with SSR disabled.
 * Follows the workspace code-editor pattern.
 */
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
	ssr: false,
	loading: () => <Skeleton className="h-[200px] w-full" />,
});

/**
 * Lazy-load JSON language extension.
 */
async function getJsonExtension() {
	const { json } = await import("@codemirror/lang-json");
	return json();
}

/**
 * WsPlayground -- Full interactive WebSocket console.
 *
 * Composes ConnectionPanel, EventTemplatePicker, CodeMirror JSON editor,
 * and EventLog into a developer-facing debugging tool.
 */
export function WsPlayground() {
	const { resolvedTheme } = useTheme();
	const connectionRef = useRef<PlaygroundConnection | null>(null);

	const jsonPayload = usePlaygroundStore((s) => s.jsonPayload);
	const connectionState = usePlaygroundStore((s) => s.connectionState);
	const error = usePlaygroundStore((s) => s.error);
	const setJsonPayload = usePlaygroundStore((s) => s.setJsonPayload);
	const addEvent = usePlaygroundStore((s) => s.addEvent);

	const [jsonError, setJsonError] = useState<string | null>(null);
	// biome-ignore lint/suspicious/noExplicitAny: CodeMirror Extension type varies
	const [jsonExt, setJsonExt] = useState<any>(null);

	// Load JSON language extension once
	useEffect(() => {
		getJsonExtension().then(setJsonExt);
	}, []);

	// Validate JSON on payload change
	useEffect(() => {
		try {
			JSON.parse(jsonPayload);
			setJsonError(null);
		} catch (e) {
			setJsonError(e instanceof Error ? e.message : "Invalid JSON");
		}
	}, [jsonPayload]);

	// Cleanup WebSocket on unmount
	useEffect(() => {
		return () => {
			connectionRef.current?.disconnect();
		};
	}, []);

	const isConnected = connectionState === "connected";
	const canSend = isConnected && !jsonError;

	const handleSend = useCallback(() => {
		if (!canSend) return;

		try {
			const parsed = JSON.parse(jsonPayload) as {
				method?: string;
				params?: Record<string, unknown>;
			};

			// Wrap in gateway JSON-RPC frame format
			const frame = {
				type: "req",
				id: nanoid(),
				method: parsed.method ?? "",
				params: parsed.params ?? parsed,
			};

			const raw = JSON.stringify(frame);
			connectionRef.current?.send(raw);

			addEvent({
				id: nanoid(),
				timestamp: new Date(),
				direction: "sent",
				type: "req",
				raw,
			});
		} catch {
			// JSON validation should prevent this, but handle gracefully
		}
	}, [canSend, jsonPayload, addEvent]);

	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	return (
		<div className="space-y-4">
			{/* Connection Panel */}
			<Card>
				<CardContent className="pt-4">
					<ConnectionPanel connectionRef={connectionRef} />
					{error && (
						<div className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
							<AlertCircle className="size-3.5" />
							{error}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Editor + Event Log */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Left column: Template picker + JSON editor + Send */}
				<Card>
					<CardContent className="space-y-4 pt-4">
						<EventTemplatePicker />

						{/* JSON Editor */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-foreground">
								Payload
							</label>
							<div
								data-color-mode={colorMode}
								className="overflow-hidden rounded-md border border-border"
							>
								<CodeMirror
									value={jsonPayload}
									{...(jsonExt ? { extensions: [jsonExt] } : {})}
									onChange={(value) => setJsonPayload(value)}
									height="200px"
									basicSetup={{
										lineNumbers: true,
										foldGutter: true,
										bracketMatching: true,
										tabSize: 2,
									}}
									theme={colorMode}
								/>
							</div>
							{jsonError && (
								<p className="flex items-center gap-1 text-xs text-destructive">
									<AlertCircle className="size-3" />
									{jsonError}
								</p>
							)}
						</div>

						{/* Send button */}
						<Button
							onClick={handleSend}
							disabled={!canSend}
							className="w-full"
						>
							<Send className="mr-1.5 size-4" />
							Send
						</Button>
					</CardContent>
				</Card>

				{/* Right column: Event Log */}
				<Card className="overflow-hidden">
					<EventLog />
				</Card>
			</div>
		</div>
	);
}
