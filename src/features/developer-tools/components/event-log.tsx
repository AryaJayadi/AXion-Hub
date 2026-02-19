"use client";

import { useCallback, useState } from "react";
import {
	ArrowRight,
	ArrowLeft,
	Trash2,
	Download,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";
import { usePlaygroundStore } from "../model/playground-store";
import type { PlaygroundEvent } from "../model/playground-store";

/** Format a timestamp to HH:mm:ss.SSS */
function formatTimestamp(date: Date): string {
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	const s = String(date.getSeconds()).padStart(2, "0");
	const ms = String(date.getMilliseconds()).padStart(3, "0");
	return `${h}:${m}:${s}.${ms}`;
}

/** Format raw JSON for display (first line preview). */
function getJsonPreview(raw: string): string {
	try {
		const parsed = JSON.parse(raw);
		const str = JSON.stringify(parsed);
		return str.length > 80 ? `${str.slice(0, 80)}...` : str;
	} catch {
		return raw.length > 80 ? `${raw.slice(0, 80)}...` : raw;
	}
}

/** Format raw JSON for expanded view. */
function getFormattedJson(raw: string): string {
	try {
		return JSON.stringify(JSON.parse(raw), null, 2);
	} catch {
		return raw;
	}
}

const TYPE_COLORS: Record<string, string> = {
	req: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	res: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	event: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function EventRow({ event }: { event: PlaygroundEvent }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div
			className="border-b border-border/50 last:border-b-0"
		>
			<button
				type="button"
				className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
				onClick={() => setExpanded(!expanded)}
			>
				{/* Direction arrow */}
				{event.direction === "sent" ? (
					<ArrowRight className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
				) : (
					<ArrowLeft className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
				)}

				{/* Timestamp */}
				<span className="shrink-0 font-mono text-xs text-muted-foreground">
					{formatTimestamp(event.timestamp)}
				</span>

				{/* Type badge */}
				<span
					className={cn(
						"shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
						TYPE_COLORS[event.type] ?? TYPE_COLORS.event,
					)}
				>
					{event.type}
				</span>

				{/* Preview */}
				<span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">
					{getJsonPreview(event.raw)}
				</span>

				{/* Expand toggle */}
				{expanded ? (
					<ChevronDown className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
				) : (
					<ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
				)}
			</button>

			{/* Expanded JSON body */}
			{expanded && (
				<div className="border-t border-border/30 bg-muted/30 px-3 py-2">
					<pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-foreground/90">
						{getFormattedJson(event.raw)}
					</pre>
				</div>
			)}
		</div>
	);
}

export function EventLog() {
	const events = usePlaygroundStore((s) => s.events);
	const url = usePlaygroundStore((s) => s.url);
	const clearEvents = usePlaygroundStore((s) => s.clearEvents);

	const handleExport = useCallback(() => {
		const exportData = {
			exportedAt: new Date().toISOString(),
			gatewayUrl: url,
			eventCount: events.length,
			events: events.map((e) => ({
				timestamp: e.timestamp.toISOString(),
				direction: e.direction,
				type: e.type,
				payload: (() => {
					try {
						return JSON.parse(e.raw);
					} catch {
						return e.raw;
					}
				})(),
			})),
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const blobUrl = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = blobUrl;
		a.download = `ws-playground-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(blobUrl);
	}, [events, url]);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-3 py-2">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium">Event Log</h3>
					{events.length > 0 && (
						<Badge variant="secondary" className="text-xs">
							{events.length}
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleExport}
						disabled={events.length === 0}
						className="h-7 px-2 text-xs"
					>
						<Download className="mr-1 size-3.5" />
						Export
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={clearEvents}
						disabled={events.length === 0}
						className="h-7 px-2 text-xs"
					>
						<Trash2 className="mr-1 size-3.5" />
						Clear
					</Button>
				</div>
			</div>

			{/* Event list */}
			<div className="flex-1 overflow-y-auto" style={{ maxHeight: "400px" }}>
				{events.length === 0 ? (
					<div className="flex h-full items-center justify-center p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No events yet. Connect to a gateway and send a request.
						</p>
					</div>
				) : (
					events.map((event) => (
						<EventRow key={event.id} event={event} />
					))
				)}
			</div>
		</div>
	);
}
