"use client";

/**
 * Output node -- sends results via notification or log.
 *
 * Shows output type. No source handle (terminal node).
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function OutputNodeComponent({ id, data, selected }: NodeProps) {
	const outputType = (data.outputType as string) ?? "notify";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="output"
			customSourceHandles
		>
			<p className="text-xs text-muted-foreground">
				{outputType === "notify" ? "Send notification" : "Write to log"}
			</p>
			{/* No source handle -- terminal node */}
		</BaseWorkflowNode>
	);
}

export const OutputNode = memo(OutputNodeComponent);
