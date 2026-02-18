export type TaskPriority = "critical" | "high" | "medium" | "low";

export type TaskStatus =
	| "inbox"
	| "queued"
	| "in_progress"
	| "in_review"
	| "done"
	| "archived";

export interface Subtask {
	id: string;
	title: string;
	completed: boolean;
}

export interface Deliverable {
	id: string;
	type: "file" | "code" | "link";
	title: string;
	url: string;
	thumbnailUrl: string | undefined;
	mimeType: string | undefined;
	submittedAt: Date;
	submittedBy: string;
}

export interface Mention {
	type: "agent" | "human";
	id: string;
	name: string;
}

export interface Task {
	id: string;
	boardId: string;
	title: string;
	description: string; // markdown
	priority: TaskPriority;
	status: TaskStatus;
	assignedAgentIds: string[];
	reviewerId: string | undefined;
	tags: string[];
	subtasks: Subtask[];
	deliverables: Deliverable[];
	signOffRequired: boolean;
	signOffStatus:
		| "pending"
		| "approved"
		| "rejected"
		| "revision_requested"
		| undefined;
	parentTaskId: string | undefined;
	dueDate: Date | undefined;
	createdAt: Date;
	updatedAt: Date;
	columnOrder: number;
}

export interface TaskComment {
	id: string;
	taskId: string;
	authorId: string;
	authorType: "user" | "agent";
	content: string;
	mentions: Mention[];
	createdAt: Date;
}

export interface BoardColumn {
	id: string;
	name: string;
	semanticRole: TaskStatus | null;
	order: number;
	isHumanOnly: boolean;
}

export interface Board {
	id: string;
	name: string;
	orgId: string;
	columns: BoardColumn[];
	createdAt: Date;
}

export interface AgentActivityDetail {
	type: "tool_call" | "reasoning" | "output";
	content: string;
	timestamp: Date;
}

export interface ActivityEntry {
	id: string;
	taskId: string;
	type:
		| "status_change"
		| "comment"
		| "deliverable"
		| "assignment"
		| "agent_detail";
	summary: string;
	timestamp: Date;
	actorId: string;
	actorType: "user" | "agent" | "system";
	details: unknown | undefined;
	agentDetails: AgentActivityDetail[] | undefined;
}
