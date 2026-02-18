"use client";

/**
 * Single tool call node in the pipeline visualization.
 *
 * Renders with framer-motion animated transitions between states:
 * pending (gray), running (amber pulse), completed (green), error (red).
 * Clicking a node opens its output in a side panel.
 */

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import type { ToolCallInfo } from "@/entities/chat-message";
import { cn } from "@/shared/lib/cn";

interface ToolCallNodeProps {
	tool: ToolCallInfo;
	index: number;
	onViewOutput: (tool: ToolCallInfo) => void;
	/** Whether there is a next node (to draw connecting line) */
	showConnector: boolean;
}

const statusConfig = {
	pending: {
		border: "border-muted-foreground/30 border-dashed",
		bg: "bg-muted/30",
		text: "text-muted-foreground",
		dotColor: "bg-muted-foreground/40",
		connectorColor: "bg-muted-foreground/20",
	},
	running: {
		border: "border-amber-500/50",
		bg: "bg-amber-500/10",
		text: "text-amber-600 dark:text-amber-400",
		dotColor: "bg-amber-500",
		connectorColor: "bg-amber-500/30",
	},
	completed: {
		border: "border-green-500/50",
		bg: "bg-green-500/10",
		text: "text-green-600 dark:text-green-400",
		dotColor: "bg-green-500",
		connectorColor: "bg-green-500/50",
	},
	error: {
		border: "border-destructive/50",
		bg: "bg-destructive/10",
		text: "text-destructive",
		dotColor: "bg-destructive",
		connectorColor: "bg-destructive/30",
	},
} as const;

function StatusIcon({ status }: { status: ToolCallInfo["status"] }) {
	switch (status) {
		case "pending":
			return <span className="size-3 rounded-full bg-muted-foreground/40" />;
		case "running":
			return <Loader2 className="size-3.5 animate-spin text-amber-500" />;
		case "completed":
			return <CheckCircle className="size-3.5 text-green-500" />;
		case "error":
			return <XCircle className="size-3.5 text-destructive" />;
	}
}

export function ToolCallNode({
	tool,
	index,
	onViewOutput,
	showConnector,
}: ToolCallNodeProps) {
	const config = statusConfig[tool.status];

	return (
		<div className="relative">
			<motion.button
				type="button"
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.1, duration: 0.2 }}
				onClick={() => onViewOutput(tool)}
				className={cn(
					"flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors",
					"hover:bg-accent/50",
					config.border,
					config.bg,
				)}
			>
				<StatusIcon status={tool.status} />
				<span className={cn("flex-1 truncate text-xs font-medium", config.text)}>
					{tool.name}
				</span>
				<ChevronRight className="size-3 shrink-0 text-muted-foreground" />
			</motion.button>

			{/* Connecting line to next node */}
			{showConnector && (
				<div className="flex justify-start pl-[17px]">
					<motion.div
						className={cn("h-2 w-px", config.connectorColor)}
						initial={{ scaleY: 0 }}
						animate={{ scaleY: 1 }}
						transition={{ delay: index * 0.1 + 0.15, duration: 0.15 }}
					/>
				</div>
			)}
		</div>
	);
}
