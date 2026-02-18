"use client";

/**
 * Collapsible "thinking step" block for tool call visualization.
 *
 * Shows a summary header (running/completed/error) that expands to
 * reveal the animated pipeline of individual tool calls. Clicking
 * a tool opens the ToolOutputPanel sheet.
 */

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import type { ToolCallInfo } from "@/entities/chat-message";
import { cn } from "@/shared/lib/cn";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { ToolCallPipeline } from "./tool-call-pipeline";
import { ToolOutputPanel } from "./tool-output-panel";

interface ToolCallGroupProps {
	tools: ToolCallInfo[];
	isExecuting: boolean;
}

export function ToolCallGroup({ tools, isExecuting }: ToolCallGroupProps) {
	const [selectedTool, setSelectedTool] = useState<ToolCallInfo | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const completedCount = tools.filter((t) => t.status === "completed").length;
	const hasError = tools.some((t) => t.status === "error");

	return (
		<>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="mt-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
					<CollapsibleTrigger className="flex w-full items-center gap-2 text-left">
						<ChevronRight
							className={cn(
								"size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						/>
						{isExecuting ? (
							<>
								<Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
								<span className="text-xs text-muted-foreground">
									Running tools ({completedCount}/{tools.length})...
								</span>
							</>
						) : hasError ? (
							<>
								<XCircle className="size-3.5 shrink-0 text-destructive" />
								<span className="text-xs text-destructive">Tool error</span>
							</>
						) : (
							<>
								<CheckCircle className="size-3.5 shrink-0 text-green-500" />
								<span className="text-xs text-muted-foreground">
									Used {tools.length} tool{tools.length !== 1 ? "s" : ""}
								</span>
							</>
						)}
					</CollapsibleTrigger>

					<CollapsibleContent>
						<ToolCallPipeline
							tools={tools}
							onViewOutput={setSelectedTool}
						/>
					</CollapsibleContent>
				</div>
			</Collapsible>

			<ToolOutputPanel
				tool={selectedTool}
				open={selectedTool !== null}
				onClose={() => setSelectedTool(null)}
			/>
		</>
	);
}
