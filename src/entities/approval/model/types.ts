export type ApprovalPriority = "critical" | "high" | "medium" | "low";

export interface ApprovalItem {
	taskId: string;
	taskTitle: string;
	taskDescription: string;
	agentId: string;
	agentName: string;
	priority: ApprovalPriority;
	deliverableCount: number;
	submittedAt: Date;
	signOffStatus: "pending";
}

export interface ApprovalAction {
	type: "approve" | "reject" | "revision";
	comment: string;
	reviewedAt: Date;
}

export interface ApprovalDeliverable {
	id: string;
	name: string;
	type: "file" | "code" | "link";
	content: string | undefined;
	url: string | undefined;
	size: number | undefined;
}

export interface ApprovalActivityEntry {
	timestamp: Date;
	action: string;
	actor: string;
}

export interface ApprovalDetail extends ApprovalItem {
	deliverables: ApprovalDeliverable[];
	taskActivity: ApprovalActivityEntry[];
}
