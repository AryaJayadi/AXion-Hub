import type { EventBus } from "@/features/gateway-connection";
import { useBoardStore } from "../model/board-store";
import { useTaskStore } from "../model/task-store";

/**
 * Initialize EventBus subscriptions for mission/task real-time events.
 * Returns a cleanup function that unsubscribes all listeners.
 *
 * @example
 * const cleanup = initMissionStoreSubscriptions(eventBus);
 * // On unmount: cleanup();
 */
export function initMissionStoreSubscriptions(
	eventBus: EventBus,
): () => void {
	const unsubs: (() => void)[] = [];

	// Agent started working on a task -> auto-transition to in_progress
	unsubs.push(
		eventBus.on("task.agent.started", ({ taskId }) => {
			useBoardStore.getState().autoTransition(taskId, "in_progress");
		}),
	);

	// Agent submitted a deliverable -> add deliverable + auto-transition to in_review
	unsubs.push(
		eventBus.on("task.deliverable.submitted", ({ taskId, deliverable }) => {
			useTaskStore.getState().addDeliverable(taskId, {
				id: deliverable.id,
				type: deliverable.type as "file" | "code" | "link",
				title: deliverable.title,
				url: deliverable.url,
				thumbnailUrl: undefined,
				mimeType: undefined,
				submittedAt: new Date(),
				submittedBy: "agent",
			});
			useBoardStore.getState().autoTransition(taskId, "in_review");
		}),
	);

	// Task status updated -> add activity entry
	unsubs.push(
		eventBus.on(
			"task.status.updated",
			({ taskId, agentId, status }) => {
				useTaskStore.getState().addActivityEntry(taskId, {
					id: `activity-${Date.now()}`,
					taskId,
					type: "status_change",
					summary: `Status changed to ${status}`,
					timestamp: new Date(),
					actorId: agentId,
					actorType: "agent",
					details: { status },
					agentDetails: undefined,
				});
			},
		),
	);

	// Task comment added -> placeholder for future comment handling
	unsubs.push(
		eventBus.on("task.comment.added", (_payload) => {
			// Comment handling will be implemented in 06-02 (task detail slide-over)
		}),
	);

	return () => {
		for (const unsub of unsubs) {
			unsub();
		}
	};
}
