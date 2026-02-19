"use client";

/**
 * Approval Gate node -- pauses execution until approved by a human.
 *
 * Shows approver. Two source handles: "approved" (green) and "rejected" (red).
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function ApprovalGateNodeComponent({ id, data, selected }: NodeProps) {
	const approver = (data.approver as string) || "Unassigned";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="approvalGate"
			customSourceHandles
		>
			<p className="text-xs text-muted-foreground truncate">
				Approver: {approver}
			</p>

			{/* Approved handle (left, green) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="approved"
				className="!bg-green-500"
				style={{ left: "30%" }}
			/>
			{/* Rejected handle (right, red) */}
			<Handle
				type="source"
				position={Position.Bottom}
				id="rejected"
				className="!bg-red-500"
				style={{ left: "70%" }}
			/>
		</BaseWorkflowNode>
	);
}

export const ApprovalGateNode = memo(ApprovalGateNodeComponent);
