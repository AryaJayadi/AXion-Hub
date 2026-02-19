"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import type { ApprovalItem } from "@/entities/approval";

/** Mock pending approval items */
const MOCK_APPROVALS: ApprovalItem[] = [
	{
		taskId: "appr-001",
		taskTitle: "Data migration script",
		taskDescription:
			"Migrate user data from legacy PostgreSQL schema to new normalized structure with rollback support.",
		agentId: "agent-data",
		agentName: "Data Agent",
		priority: "critical",
		deliverableCount: 1,
		submittedAt: new Date(Date.now() - 30 * 60_000), // 30 min ago
		signOffStatus: "pending",
	},
	{
		taskId: "appr-002",
		taskTitle: "Security audit report",
		taskDescription:
			"Comprehensive security audit covering authentication flows, API endpoints, and data access patterns.",
		agentId: "agent-research",
		agentName: "Research Agent",
		priority: "high",
		deliverableCount: 3,
		submittedAt: new Date(Date.now() - 2 * 60 * 60_000), // 2 hours ago
		signOffStatus: "pending",
	},
	{
		taskId: "appr-003",
		taskTitle: "Performance optimization",
		taskDescription:
			"Database query optimization and caching layer improvements for dashboard endpoints.",
		agentId: "agent-code-1",
		agentName: "Code Agent",
		priority: "high",
		deliverableCount: 4,
		submittedAt: new Date(Date.now() - 4 * 60 * 60_000), // 4 hours ago
		signOffStatus: "pending",
	},
	{
		taskId: "appr-004",
		taskTitle: "API endpoint implementation",
		taskDescription:
			"REST API endpoints for agent configuration CRUD operations with validation and error handling.",
		agentId: "agent-code-2",
		agentName: "Code Agent",
		priority: "medium",
		deliverableCount: 2,
		submittedAt: new Date(Date.now() - 8 * 60 * 60_000), // 8 hours ago
		signOffStatus: "pending",
	},
	{
		taskId: "appr-005",
		taskTitle: "User documentation",
		taskDescription:
			"End-user documentation covering agent setup, mission board usage, and governance workflows.",
		agentId: "agent-writer",
		agentName: "Writer Agent",
		priority: "low",
		deliverableCount: 2,
		submittedAt: new Date(Date.now() - 24 * 60 * 60_000), // 1 day ago
		signOffStatus: "pending",
	},
	{
		taskId: "appr-006",
		taskTitle: "Integration test suite",
		taskDescription:
			"End-to-end integration tests for the channel pairing and routing workflows.",
		agentId: "agent-qa",
		agentName: "QA Agent",
		priority: "medium",
		deliverableCount: 3,
		submittedAt: new Date(Date.now() - 36 * 60 * 60_000), // 1.5 days ago
		signOffStatus: "pending",
	},
];

// TODO: Replace with real API call when wired
async function fetchApprovals(): Promise<ApprovalItem[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	// Return sorted by submittedAt descending (newest first)
	return [...MOCK_APPROVALS].sort(
		(a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
	);
}

/**
 * Fetches all pending approval items.
 * staleTime: 30s -- approvals should refresh more often than other data.
 */
export function useApprovals() {
	return useQuery({
		queryKey: queryKeys.approvals.lists(),
		queryFn: fetchApprovals,
		staleTime: 30_000,
	});
}
