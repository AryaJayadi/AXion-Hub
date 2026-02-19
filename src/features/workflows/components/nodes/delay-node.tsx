"use client";

/**
 * Delay node -- waits for a specified duration.
 *
 * Shows duration value and unit. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function DelayNodeComponent({ id, data, selected }: NodeProps) {
	const duration = (data.duration as number) ?? 5;
	const unit = (data.unit as string) ?? "minutes";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="delay"
		>
			<p className="text-xs text-muted-foreground">
				Wait {duration} {unit}
			</p>
		</BaseWorkflowNode>
	);
}

export const DelayNode = memo(DelayNodeComponent);
