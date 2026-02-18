"use client";

/**
 * Single agent streaming lane component.
 *
 * Renders an agent's in-progress streaming response with Streamdown
 * live markdown rendering and a tool call indicator. Used within
 * StreamingLanes for multi-agent parallel display.
 */

import dynamic from "next/dynamic";
import { Bot, Wrench } from "lucide-react";
import type { StreamingLane as StreamingLaneType } from "@/entities/chat-message";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

// Dynamic import Streamdown to avoid SSR issues
const Streamdown = dynamic(
	() => import("streamdown").then((mod) => mod.Streamdown),
	{ ssr: false },
);

// Dynamic import code plugin
let codePlugin: import("streamdown").PluginConfig["code"] | undefined;
import("@streamdown/code").then((mod) => {
	codePlugin = mod.code;
});

/** Small palette for agent-specific lane border colors */
const LANE_COLORS = [
	"border-blue-500/50",
	"border-purple-500/50",
	"border-emerald-500/50",
	"border-amber-500/50",
	"border-rose-500/50",
	"border-cyan-500/50",
	"border-indigo-500/50",
	"border-teal-500/50",
];

/** Deterministic color from agent ID hash */
function getLaneColor(agentId: string): string {
	let hash = 0;
	for (let i = 0; i < agentId.length; i++) {
		hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0;
	}
	return LANE_COLORS[Math.abs(hash) % LANE_COLORS.length] ?? LANE_COLORS[0] ?? "border-blue-500/50";
}

interface StreamingLaneProps {
	lane: StreamingLaneType;
}

/**
 * Renders a single agent's streaming area with:
 * - Agent avatar + name header
 * - Live Streamdown markdown rendering
 * - Tool call indicator when tools are in use
 * - Agent-specific border color for visual distinction
 */
export function StreamingLane({ lane }: StreamingLaneProps) {
	const borderColor = getLaneColor(lane.agentId);
	const hasActiveTools = lane.toolCalls.some(
		(tc) => tc.status === "running" || tc.status === "pending",
	);

	return (
		<div
			className={cn(
				"border-l-2 pl-3 py-2",
				borderColor,
			)}
		>
			{/* Agent header */}
			<div className="flex items-center gap-2 mb-1.5">
				<Avatar size="sm">
					<AvatarFallback className="bg-secondary/10 text-secondary">
						<Bot className="size-3" />
					</AvatarFallback>
				</Avatar>
				<span className="text-xs font-medium text-muted-foreground">
					{lane.agentName || lane.agentId}
				</span>
				{lane.isActive && (
					<span className="inline-block size-1.5 animate-pulse rounded-full bg-green-500" />
				)}
			</div>

			{/* Streaming content */}
			{lane.accumulatedText && (
				<div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
					<Streamdown
						{...(codePlugin ? { plugins: { code: codePlugin } } : {})}
						isAnimating={lane.isActive}
					>
						{lane.accumulatedText}
					</Streamdown>
				</div>
			)}

			{/* Tool call indicator (brief -- full visualization in 04-03) */}
			{hasActiveTools && (
				<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Wrench className="size-3 animate-spin" />
					<span>
						Using tools ({lane.toolCalls.filter((tc) => tc.status === "completed").length}/
						{lane.toolCalls.length})...
					</span>
				</div>
			)}
		</div>
	);
}
