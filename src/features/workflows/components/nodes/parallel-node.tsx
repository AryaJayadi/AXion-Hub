"use client";

/**
 * Parallel node -- runs multiple branches simultaneously.
 *
 * Two source handles: "fan-out" and "fan-in".
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function ParallelNodeComponent({ id, data, selected }: NodeProps) {
	const branchCount = (data.branchCount as number) ?? 2;

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="parallel"
			customSourceHandles
		>
			<p className="text-xs text-muted-foreground">
				{branchCount} branches
			</p>

			{/* Fan-out handle (left) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="fan-out"
				className="!bg-amber-500"
				style={{ left: "30%" }}
			/>
			{/* Fan-in handle (right) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="fan-in"
				className="!bg-muted-foreground"
				style={{ left: "70%" }}
			/>
		</BaseWorkflowNode>
	);
}

export const ParallelNode = memo(ParallelNodeComponent);
