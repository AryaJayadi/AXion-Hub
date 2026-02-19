"use client";

/**
 * Trigger node -- entry point for a workflow.
 *
 * Shows trigger sub-type (manual/cron/webhook/event). Has no target handle
 * (nothing feeds into it). One source handle at bottom.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

const TRIGGER_LABELS: Record<string, string> = {
	manual: "Manual trigger",
	cron: "Scheduled (cron)",
	webhook: "Webhook listener",
	event: "Event-driven",
};

function TriggerNodeComponent({ id, data, selected }: NodeProps) {
	const subType = (data.subType as string) ?? "manual";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="trigger"
			noTargetHandle
		>
			<p className="text-xs text-muted-foreground">
				{TRIGGER_LABELS[subType] ?? subType}
			</p>
		</BaseWorkflowNode>
	);
}

export const TriggerNode = memo(TriggerNodeComponent);
