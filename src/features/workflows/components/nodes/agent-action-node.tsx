"use client";

/**
 * Agent Action node -- executes an action via an AI agent.
 *
 * Shows agent name and action description. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

function AgentActionNodeComponent({ id, data, selected }: NodeProps) {
	const agentName = (data.agentName as string) || "No agent selected";
	const description = (data.actionDescription as string) || "";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="agentAction"
		>
			<p className="text-xs font-medium text-foreground/80 truncate">
				{agentName}
			</p>
			{description && (
				<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
					{description}
				</p>
			)}
		</BaseWorkflowNode>
	);
}

export const AgentActionNode = memo(AgentActionNodeComponent);
