"use client";

/**
 * Sub-workflow node -- invokes another workflow as a step.
 *
 * Shows referenced workflow name. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function SubWorkflowNodeComponent({ id, data, selected }: NodeProps) {
	const workflowId = (data.workflowId as string) || "";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="subWorkflow"
		>
			<p className="text-xs text-muted-foreground truncate">
				{workflowId ? `Workflow: ${workflowId}` : "No workflow selected"}
			</p>
		</BaseWorkflowNode>
	);
}

export const SubWorkflowNode = memo(SubWorkflowNodeComponent);
