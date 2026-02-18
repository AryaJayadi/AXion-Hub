"use client";

/**
 * Animated step-through pipeline visualization for tool calls.
 *
 * Renders tool calls as a vertical pipeline with connecting lines
 * between nodes. Uses AnimatePresence for smooth add/remove transitions.
 */

import { AnimatePresence } from "framer-motion";
import type { ToolCallInfo } from "@/entities/chat-message";
import { ToolCallNode } from "./tool-call-node";

interface ToolCallPipelineProps {
	tools: ToolCallInfo[];
	onViewOutput: (tool: ToolCallInfo) => void;
}

export function ToolCallPipeline({
	tools,
	onViewOutput,
}: ToolCallPipelineProps) {
	return (
		<div className="flex flex-col gap-1 pl-6 pt-2">
			<AnimatePresence mode="popLayout">
				{tools.map((tool, index) => (
					<ToolCallNode
						key={tool.id}
						tool={tool}
						index={index}
						onViewOutput={onViewOutput}
						showConnector={index < tools.length - 1}
					/>
				))}
			</AnimatePresence>
		</div>
	);
}
