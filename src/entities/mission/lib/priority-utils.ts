import type { Task, TaskPriority } from "../model/types";

/** Tailwind classes for the priority left border stripe on kanban cards */
export const PRIORITY_BORDER: Record<TaskPriority, string> = {
	critical: "border-l-4 border-l-red-500",
	high: "border-l-4 border-l-orange-500",
	medium: "border-l-4 border-l-blue-500",
	low: "border-l-4 border-l-gray-400",
};

/** Badge label and color mapping per priority */
export const PRIORITY_BADGE: Record<
	TaskPriority,
	{ label: string; className: string }
> = {
	critical: { label: "Critical", className: "text-red-600 border-red-300" },
	high: { label: "High", className: "text-orange-600 border-orange-300" },
	medium: { label: "Medium", className: "text-blue-600 border-blue-300" },
	low: { label: "Low", className: "text-gray-600 border-gray-300" },
};

/** Numeric sort order for priority comparisons (lower = higher priority) */
export const prioritySortOrder: Record<TaskPriority, number> = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3,
};

/** Comparator for sorting tasks by priority (critical first) */
export function sortByPriority(a: Task, b: Task): number {
	return prioritySortOrder[a.priority] - prioritySortOrder[b.priority];
}

/**
 * Returns Tailwind classes for the pulsing glow when an agent is actively working on a card.
 * Uses box-shadow (not border-width) to prevent layout shift, matching Phase 3 glow pattern.
 */
export function getTaskGlowClasses(isAgentWorking: boolean): string {
	if (!isAgentWorking) return "";
	return "shadow-[0_0_8px_-1px] shadow-blue-500/50 border-blue-500/30 animate-pulse";
}
