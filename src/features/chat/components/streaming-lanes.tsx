"use client";

/**
 * Multi-agent parallel streaming lane container.
 *
 * Renders all active streaming lanes for a conversation.
 * Each agent gets a dedicated visual lane with a colored border
 * for distinction. Returns null when no agents are streaming.
 */

import { useStreamingLanes } from "../model/hooks";
import { StreamingLane } from "./streaming-lane";

interface StreamingLanesProps {
	conversationId: string;
}

/**
 * Container that displays separate streaming areas for each agent
 * that is currently generating a response in the conversation.
 */
export function StreamingLanes({ conversationId }: StreamingLanesProps) {
	const lanes = useStreamingLanes(conversationId);

	if (lanes.length === 0) return null;

	return (
		<div className="flex flex-col gap-3 border-t border-border/50 pt-3 px-4">
			{lanes.map((lane) => (
				<StreamingLane
					key={`${conversationId}:${lane.agentId}`}
					lane={lane}
				/>
			))}
		</div>
	);
}
