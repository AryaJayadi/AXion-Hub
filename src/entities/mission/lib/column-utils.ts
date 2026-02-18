import type { BoardColumn, TaskStatus } from "../model/types";

/** The 6 default Kanban columns with semantic role mapping */
export const CORE_COLUMNS: BoardColumn[] = [
	{
		id: "col-inbox",
		name: "INBOX",
		semanticRole: "inbox",
		order: 0,
		isHumanOnly: false,
	},
	{
		id: "col-queued",
		name: "QUEUED",
		semanticRole: "queued",
		order: 1,
		isHumanOnly: false,
	},
	{
		id: "col-in-progress",
		name: "IN PROGRESS",
		semanticRole: "in_progress",
		order: 2,
		isHumanOnly: false,
	},
	{
		id: "col-in-review",
		name: "IN REVIEW",
		semanticRole: "in_review",
		order: 3,
		isHumanOnly: true,
	},
	{
		id: "col-done",
		name: "DONE",
		semanticRole: "done",
		order: 4,
		isHumanOnly: false,
	},
	{
		id: "col-archived",
		name: "ARCHIVED",
		semanticRole: "archived",
		order: 5,
		isHumanOnly: false,
	},
];

/** Find a column by its semantic role */
export function getColumnBySemanticRole(
	columns: BoardColumn[],
	role: TaskStatus,
): BoardColumn | undefined {
	return columns.find((c) => c.semanticRole === role);
}

/** Check if a column is restricted to human-only actions */
export function isHumanOnlyColumn(column: BoardColumn): boolean {
	return column.isHumanOnly;
}

/** Display configuration for each task status */
export const COLUMN_DISPLAY: Record<
	TaskStatus,
	{ label: string; icon: string }
> = {
	inbox: { label: "Inbox", icon: "Inbox" },
	queued: { label: "Queued", icon: "ListOrdered" },
	in_progress: { label: "In Progress", icon: "Play" },
	in_review: { label: "In Review", icon: "Eye" },
	done: { label: "Done", icon: "CheckCircle" },
	archived: { label: "Archived", icon: "Archive" },
};
