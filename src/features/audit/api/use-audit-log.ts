"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";

/** Shape matching existing Drizzle audit_logs schema */
export interface AuditLogEntry {
	id: string;
	timestamp: Date;
	actor: string;
	action:
		| "create"
		| "update"
		| "delete"
		| "approve"
		| "reject"
		| "login"
		| "logout";
	resourceType:
		| "task"
		| "agent"
		| "session"
		| "file"
		| "policy"
		| "user";
	resourceId: string;
	metadata: Record<string, unknown> | undefined;
	beforeState: Record<string, unknown> | undefined;
	afterState: Record<string, unknown> | undefined;
	ipAddress: string | undefined;
	correlationId: string | undefined;
	hashChainPrev: string | undefined;
}

export interface AuditLogFilters {
	actor?: string;
	action?: string;
	resourceType?: string;
	period?: "7d" | "30d" | "all";
}

/** Deterministic seed for mock data generation */
function seededId(index: number): string {
	return `audit-${(index + 1000).toString(36)}`;
}

/** Generate mock audit entries spanning the last 7 days */
function generateMockAuditEntries(): AuditLogEntry[] {
	const now = Date.now();
	const DAY = 86_400_000;

	const actors = [
		"alice@axion.dev",
		"bob@axion.dev",
		"carol@axion.dev",
		"system",
		"dave@axion.dev",
	];

	const entries: AuditLogEntry[] = [
		// Login/logout entries
		{
			id: seededId(0),
			timestamp: new Date(now - 0.1 * DAY),
			actor: "alice@axion.dev",
			action: "login",
			resourceType: "user",
			resourceId: "user-alice",
			metadata: { userAgent: "Mozilla/5.0 Chrome/121" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "192.168.1.10",
			correlationId: "sess-a1b2c3",
			hashChainPrev: "0x8f3a...d2e1",
		},
		{
			id: seededId(1),
			timestamp: new Date(now - 0.2 * DAY),
			actor: "bob@axion.dev",
			action: "login",
			resourceType: "user",
			resourceId: "user-bob",
			metadata: { userAgent: "Mozilla/5.0 Safari/17" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "10.0.0.42",
			correlationId: "sess-d4e5f6",
			hashChainPrev: "0x7e2b...c3f0",
		},
		// Task approvals
		{
			id: seededId(2),
			timestamp: new Date(now - 0.5 * DAY),
			actor: "alice@axion.dev",
			action: "approve",
			resourceType: "task",
			resourceId: "task-deploy-v2",
			metadata: { comment: "Looks good, ship it" },
			beforeState: { status: "in_review", assignee: "agent-coder" },
			afterState: { status: "done", assignee: "agent-coder", approvedBy: "alice@axion.dev" },
			ipAddress: "192.168.1.10",
			correlationId: "corr-approve-1",
			hashChainPrev: "0x6d1a...b4e2",
		},
		{
			id: seededId(3),
			timestamp: new Date(now - 0.7 * DAY),
			actor: "carol@axion.dev",
			action: "reject",
			resourceType: "task",
			resourceId: "task-refactor-auth",
			metadata: { reason: "Missing test coverage for edge cases" },
			beforeState: { status: "in_review" },
			afterState: { status: "in_progress", rejectedBy: "carol@axion.dev" },
			ipAddress: "172.16.0.5",
			correlationId: "corr-reject-1",
			hashChainPrev: "0x5c0b...a3d1",
		},
		// Agent config changes
		{
			id: seededId(4),
			timestamp: new Date(now - 1.0 * DAY),
			actor: "bob@axion.dev",
			action: "update",
			resourceType: "agent",
			resourceId: "agent-coder",
			metadata: undefined,
			beforeState: { model: "claude-sonnet-4", temperature: 0.7 },
			afterState: { model: "claude-opus-4", temperature: 0.5 },
			ipAddress: "10.0.0.42",
			correlationId: "corr-agent-cfg-1",
			hashChainPrev: "0x4b9c...92c0",
		},
		{
			id: seededId(5),
			timestamp: new Date(now - 1.2 * DAY),
			actor: "system",
			action: "update",
			resourceType: "agent",
			resourceId: "agent-researcher",
			metadata: { trigger: "auto-scaling" },
			beforeState: { maxConcurrency: 3 },
			afterState: { maxConcurrency: 5 },
			ipAddress: undefined,
			correlationId: "corr-auto-scale-1",
			hashChainPrev: "0x3a8d...81bf",
		},
		// File uploads
		{
			id: seededId(6),
			timestamp: new Date(now - 1.5 * DAY),
			actor: "alice@axion.dev",
			action: "create",
			resourceType: "file",
			resourceId: "file-report-q4.pdf",
			metadata: { fileSize: "2.4MB", mimeType: "application/pdf" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "192.168.1.10",
			correlationId: "corr-upload-1",
			hashChainPrev: "0x297e...70ae",
		},
		{
			id: seededId(7),
			timestamp: new Date(now - 1.8 * DAY),
			actor: "dave@axion.dev",
			action: "create",
			resourceType: "file",
			resourceId: "file-schema-v3.sql",
			metadata: { fileSize: "12KB", mimeType: "text/plain" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "10.0.0.99",
			correlationId: "corr-upload-2",
			hashChainPrev: "0x186f...6f9d",
		},
		// Policy updates
		{
			id: seededId(8),
			timestamp: new Date(now - 2.0 * DAY),
			actor: "carol@axion.dev",
			action: "create",
			resourceType: "policy",
			resourceId: "policy-require-approval",
			metadata: undefined,
			beforeState: undefined,
			afterState: { name: "Require approval for high-priority tasks", enabled: true },
			ipAddress: "172.16.0.5",
			correlationId: "corr-policy-1",
			hashChainPrev: "0x0750...5e8c",
		},
		{
			id: seededId(9),
			timestamp: new Date(now - 2.2 * DAY),
			actor: "alice@axion.dev",
			action: "update",
			resourceType: "policy",
			resourceId: "policy-block-tools",
			metadata: undefined,
			beforeState: { enabled: false },
			afterState: { enabled: true },
			ipAddress: "192.168.1.10",
			correlationId: "corr-policy-2",
			hashChainPrev: "0xf641...4d7b",
		},
		// Session events
		{
			id: seededId(10),
			timestamp: new Date(now - 2.5 * DAY),
			actor: "system",
			action: "create",
			resourceType: "session",
			resourceId: "sess-agent-coder-42",
			metadata: { agentId: "agent-coder", trigger: "task-assignment" },
			beforeState: undefined,
			afterState: { status: "active" },
			ipAddress: undefined,
			correlationId: "corr-sess-1",
			hashChainPrev: "0xe532...3c6a",
		},
		{
			id: seededId(11),
			timestamp: new Date(now - 2.8 * DAY),
			actor: "system",
			action: "update",
			resourceType: "session",
			resourceId: "sess-agent-researcher-7",
			metadata: { reason: "timeout" },
			beforeState: { status: "active", duration: "4h 32m" },
			afterState: { status: "completed", duration: "4h 32m" },
			ipAddress: undefined,
			correlationId: "corr-sess-2",
			hashChainPrev: "0xd423...2b59",
		},
		// More task updates
		{
			id: seededId(12),
			timestamp: new Date(now - 3.0 * DAY),
			actor: "system",
			action: "update",
			resourceType: "task",
			resourceId: "task-analyze-logs",
			metadata: { agentId: "agent-researcher" },
			beforeState: { status: "queued", column: "QUEUED" },
			afterState: { status: "in_progress", column: "IN PROGRESS" },
			ipAddress: undefined,
			correlationId: "corr-task-move-1",
			hashChainPrev: "0xc314...1a48",
		},
		{
			id: seededId(13),
			timestamp: new Date(now - 3.2 * DAY),
			actor: "bob@axion.dev",
			action: "create",
			resourceType: "task",
			resourceId: "task-deploy-v2",
			metadata: { priority: "high", board: "Engineering" },
			beforeState: undefined,
			afterState: { title: "Deploy v2 to production", priority: "high", status: "inbox" },
			ipAddress: "10.0.0.42",
			correlationId: "corr-task-create-1",
			hashChainPrev: "0xb205...0937",
		},
		// More logins
		{
			id: seededId(14),
			timestamp: new Date(now - 3.5 * DAY),
			actor: "carol@axion.dev",
			action: "login",
			resourceType: "user",
			resourceId: "user-carol",
			metadata: { userAgent: "Mozilla/5.0 Firefox/122" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "172.16.0.5",
			correlationId: "sess-g7h8i9",
			hashChainPrev: "0xa1f6...f826",
		},
		{
			id: seededId(15),
			timestamp: new Date(now - 3.5 * DAY),
			actor: "dave@axion.dev",
			action: "login",
			resourceType: "user",
			resourceId: "user-dave",
			metadata: { userAgent: "Mozilla/5.0 Chrome/121" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "10.0.0.99",
			correlationId: "sess-j0k1l2",
			hashChainPrev: "0x90e7...e715",
		},
		// Agent creation
		{
			id: seededId(16),
			timestamp: new Date(now - 4.0 * DAY),
			actor: "alice@axion.dev",
			action: "create",
			resourceType: "agent",
			resourceId: "agent-writer",
			metadata: { template: "content-writer" },
			beforeState: undefined,
			afterState: { name: "Content Writer", model: "claude-sonnet-4", status: "offline" },
			ipAddress: "192.168.1.10",
			correlationId: "corr-agent-create-1",
			hashChainPrev: "0x8fd8...d604",
		},
		// Delete events
		{
			id: seededId(17),
			timestamp: new Date(now - 4.2 * DAY),
			actor: "bob@axion.dev",
			action: "delete",
			resourceType: "file",
			resourceId: "file-draft-readme.md",
			metadata: { reason: "Superseded by updated version" },
			beforeState: { name: "draft-readme.md", size: "8KB" },
			afterState: undefined,
			ipAddress: "10.0.0.42",
			correlationId: "corr-delete-1",
			hashChainPrev: "0x7ec9...c5f3",
		},
		{
			id: seededId(18),
			timestamp: new Date(now - 4.5 * DAY),
			actor: "carol@axion.dev",
			action: "delete",
			resourceType: "task",
			resourceId: "task-old-migration",
			metadata: undefined,
			beforeState: { title: "Run legacy migration", status: "archived" },
			afterState: undefined,
			ipAddress: "172.16.0.5",
			correlationId: "corr-delete-2",
			hashChainPrev: "0x6dba...b4e2",
		},
		// Logouts
		{
			id: seededId(19),
			timestamp: new Date(now - 4.8 * DAY),
			actor: "alice@axion.dev",
			action: "logout",
			resourceType: "user",
			resourceId: "user-alice",
			metadata: undefined,
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "192.168.1.10",
			correlationId: "sess-a1b2c3",
			hashChainPrev: "0x5cab...a3d1",
		},
		// More updates
		{
			id: seededId(20),
			timestamp: new Date(now - 5.0 * DAY),
			actor: "dave@axion.dev",
			action: "update",
			resourceType: "agent",
			resourceId: "agent-coder",
			metadata: undefined,
			beforeState: { skills: ["typescript", "python"] },
			afterState: { skills: ["typescript", "python", "rust"] },
			ipAddress: "10.0.0.99",
			correlationId: "corr-agent-cfg-2",
			hashChainPrev: "0x4b9c...92c0",
		},
		{
			id: seededId(21),
			timestamp: new Date(now - 5.2 * DAY),
			actor: "system",
			action: "approve",
			resourceType: "task",
			resourceId: "task-lint-fix",
			metadata: { autoApproved: true, policyId: "policy-auto-approve-low-cost" },
			beforeState: { status: "in_review", cost: "$0.12" },
			afterState: { status: "done", cost: "$0.12", approvedBy: "system" },
			ipAddress: undefined,
			correlationId: "corr-auto-approve-1",
			hashChainPrev: "0x3a8d...81bf",
		},
		// More sessions
		{
			id: seededId(22),
			timestamp: new Date(now - 5.5 * DAY),
			actor: "system",
			action: "delete",
			resourceType: "session",
			resourceId: "sess-agent-writer-3",
			metadata: { reason: "cleanup-stale", age: "48h" },
			beforeState: { status: "idle", duration: "48h" },
			afterState: undefined,
			ipAddress: undefined,
			correlationId: "corr-cleanup-1",
			hashChainPrev: "0x297e...70ae",
		},
		{
			id: seededId(23),
			timestamp: new Date(now - 5.8 * DAY),
			actor: "bob@axion.dev",
			action: "create",
			resourceType: "task",
			resourceId: "task-refactor-auth",
			metadata: { priority: "medium", board: "Engineering" },
			beforeState: undefined,
			afterState: { title: "Refactor auth module", priority: "medium", status: "inbox" },
			ipAddress: "10.0.0.42",
			correlationId: "corr-task-create-2",
			hashChainPrev: "0x186f...6f9d",
		},
		// Policy disable
		{
			id: seededId(24),
			timestamp: new Date(now - 6.0 * DAY),
			actor: "alice@axion.dev",
			action: "update",
			resourceType: "policy",
			resourceId: "policy-notify-errors",
			metadata: undefined,
			beforeState: { enabled: true },
			afterState: { enabled: false },
			ipAddress: "192.168.1.10",
			correlationId: "corr-policy-3",
			hashChainPrev: "0x0750...5e8c",
		},
		// Agent skill toggle
		{
			id: seededId(25),
			timestamp: new Date(now - 6.1 * DAY),
			actor: "carol@axion.dev",
			action: "update",
			resourceType: "agent",
			resourceId: "agent-researcher",
			metadata: undefined,
			beforeState: { skills: ["web-search", "summarize"] },
			afterState: { skills: ["web-search", "summarize", "data-analysis"] },
			ipAddress: "172.16.0.5",
			correlationId: "corr-skill-1",
			hashChainPrev: "0xf641...4d7b",
		},
		// More file operations
		{
			id: seededId(26),
			timestamp: new Date(now - 6.3 * DAY),
			actor: "dave@axion.dev",
			action: "create",
			resourceType: "file",
			resourceId: "file-design-spec.md",
			metadata: { fileSize: "45KB", mimeType: "text/markdown" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "10.0.0.99",
			correlationId: "corr-upload-3",
			hashChainPrev: "0xe532...3c6a",
		},
		{
			id: seededId(27),
			timestamp: new Date(now - 6.5 * DAY),
			actor: "alice@axion.dev",
			action: "update",
			resourceType: "file",
			resourceId: "file-design-spec.md",
			metadata: { version: 2 },
			beforeState: { size: "45KB", version: 1 },
			afterState: { size: "52KB", version: 2 },
			ipAddress: "192.168.1.10",
			correlationId: "corr-file-update-1",
			hashChainPrev: "0xd423...2b59",
		},
		// Early logins
		{
			id: seededId(28),
			timestamp: new Date(now - 6.7 * DAY),
			actor: "bob@axion.dev",
			action: "logout",
			resourceType: "user",
			resourceId: "user-bob",
			metadata: undefined,
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "10.0.0.42",
			correlationId: "sess-m3n4o5",
			hashChainPrev: "0xc314...1a48",
		},
		{
			id: seededId(29),
			timestamp: new Date(now - 6.8 * DAY),
			actor: "system",
			action: "create",
			resourceType: "session",
			resourceId: "sess-agent-coder-41",
			metadata: { agentId: "agent-coder", trigger: "scheduled" },
			beforeState: undefined,
			afterState: { status: "active" },
			ipAddress: undefined,
			correlationId: "corr-sess-3",
			hashChainPrev: "0xb205...0937",
		},
		// Task status changes
		{
			id: seededId(30),
			timestamp: new Date(now - 6.9 * DAY),
			actor: "system",
			action: "update",
			resourceType: "task",
			resourceId: "task-lint-fix",
			metadata: { agentId: "agent-coder" },
			beforeState: { status: "in_progress" },
			afterState: { status: "in_review" },
			ipAddress: undefined,
			correlationId: "corr-task-move-2",
			hashChainPrev: "0xa1f6...f826",
		},
		{
			id: seededId(31),
			timestamp: new Date(now - 7.0 * DAY),
			actor: "alice@axion.dev",
			action: "login",
			resourceType: "user",
			resourceId: "user-alice",
			metadata: { userAgent: "Mozilla/5.0 Chrome/120" },
			beforeState: undefined,
			afterState: undefined,
			ipAddress: "192.168.1.10",
			correlationId: "sess-p6q7r8",
			hashChainPrev: "0x90e7...e715",
		},
		// More creates
		{
			id: seededId(32),
			timestamp: new Date(now - 0.3 * DAY),
			actor: "dave@axion.dev",
			action: "create",
			resourceType: "task",
			resourceId: "task-update-docs",
			metadata: { priority: "low", board: "Documentation" },
			beforeState: undefined,
			afterState: { title: "Update API docs for v2", priority: "low", status: "inbox" },
			ipAddress: "10.0.0.99",
			correlationId: "corr-task-create-3",
			hashChainPrev: "0x8fd8...d604",
		},
		{
			id: seededId(33),
			timestamp: new Date(now - 1.3 * DAY),
			actor: "carol@axion.dev",
			action: "approve",
			resourceType: "task",
			resourceId: "task-analyze-logs",
			metadata: { comment: "Analysis complete, results verified" },
			beforeState: { status: "in_review" },
			afterState: { status: "done", approvedBy: "carol@axion.dev" },
			ipAddress: "172.16.0.5",
			correlationId: "corr-approve-2",
			hashChainPrev: "0x7ec9...c5f3",
		},
		{
			id: seededId(34),
			timestamp: new Date(now - 3.8 * DAY),
			actor: "system",
			action: "update",
			resourceType: "session",
			resourceId: "sess-agent-coder-41",
			metadata: { reason: "task-complete" },
			beforeState: { status: "active", tokensUsed: 45000 },
			afterState: { status: "completed", tokensUsed: 67500 },
			ipAddress: undefined,
			correlationId: "corr-sess-4",
			hashChainPrev: "0x6dba...b4e2",
		},
	];

	// Sort by timestamp descending (newest first)
	return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const MOCK_ENTRIES = generateMockAuditEntries();

/** Filter entries based on criteria */
function filterEntries(
	entries: AuditLogEntry[],
	filters: AuditLogFilters,
): AuditLogEntry[] {
	const now = Date.now();
	const DAY = 86_400_000;

	return entries.filter((entry) => {
		// Actor filter
		if (
			filters.actor &&
			!entry.actor.toLowerCase().includes(filters.actor.toLowerCase())
		) {
			return false;
		}

		// Action filter
		if (filters.action && entry.action !== filters.action) {
			return false;
		}

		// Resource type filter
		if (filters.resourceType && entry.resourceType !== filters.resourceType) {
			return false;
		}

		// Period filter (default 7d per research Pitfall 5)
		const period = filters.period ?? "7d";
		if (period !== "all") {
			const days = period === "7d" ? 7 : 30;
			const cutoff = now - days * DAY;
			if (entry.timestamp.getTime() < cutoff) {
				return false;
			}
		}

		return true;
	});
}

// TODO: Replace with API call when backend wired
async function fetchAuditLog(
	filters: AuditLogFilters,
): Promise<AuditLogEntry[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return filterEntries(MOCK_ENTRIES, filters);
}

/**
 * Fetches audit log entries with filter support via TanStack Query.
 * staleTime: 60000 (1 minute) -- audit data refreshes periodically.
 */
export function useAuditLog(filters: AuditLogFilters = {}) {
	return useQuery({
		queryKey: queryKeys.audit.list(filters as Record<string, unknown>),
		queryFn: () => fetchAuditLog(filters),
		staleTime: 60_000,
	});
}
