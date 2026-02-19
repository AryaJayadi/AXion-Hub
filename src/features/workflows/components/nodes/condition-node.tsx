"use client";

/**
 * Condition node -- branches based on a boolean expression.
 *
 * Shows expression in monospace. Two source handles:
 * "true" (left, green) and "false" (right, red).
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function ConditionNodeComponent({ id, data, selected }: NodeProps) {
	const expression = (data.expression as string) || "expression";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="condition"
			customSourceHandles
		>
			<p className="font-mono text-xs text-muted-foreground truncate">
				{expression}
			</p>

			{/* True handle (left) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="true"
				className="!bg-green-500"
				style={{ left: "30%" }}
			/>
			{/* False handle (right) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="false"
				className="!bg-red-500"
				style={{ left: "70%" }}
			/>
		</BaseWorkflowNode>
	);
}

export const ConditionNode = memo(ConditionNodeComponent);
