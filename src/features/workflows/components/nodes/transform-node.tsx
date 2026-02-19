"use client";

/**
 * Transform node -- maps and transforms data between steps.
 *
 * Shows mapping description. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function TransformNodeComponent({ id, data, selected }: NodeProps) {
	const mapping = (data.mapping as string) || "No mapping defined";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="transform"
		>
			<p className="text-xs text-muted-foreground line-clamp-1">
				{mapping}
			</p>
		</BaseWorkflowNode>
	);
}

export const TransformNode = memo(TransformNodeComponent);
