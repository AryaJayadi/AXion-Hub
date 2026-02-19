"use client";

/**
 * Loop node -- iterates over a collection or count.
 *
 * Two source handles: "body" (loop iteration) and "done" (exit).
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function LoopNodeComponent({ id, data, selected }: NodeProps) {
	const count = (data.count as number) ?? 10;
	const collection = (data.collection as string) || "";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="loop"
			customSourceHandles
		>
			<p className="text-xs text-muted-foreground">
				{collection ? `Over: ${collection}` : `${count} iterations`}
			</p>

			{/* Body handle (left) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="body"
				className="!bg-amber-500"
				style={{ left: "30%" }}
			/>
			{/* Done handle (right) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="done"
				className="!bg-muted-foreground"
				style={{ left: "70%" }}
			/>
		</BaseWorkflowNode>
	);
}

export const LoopNode = memo(LoopNodeComponent);
