"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { ApprovalDetail } from "@/entities/approval";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";

import { useApprovals } from "@/features/approvals/api/use-approvals";
import { ApprovalReview } from "@/features/approvals/components/approval-review";
import { ApprovalActionPanel } from "@/features/approvals/components/approval-action-panel";

/** Generate mock deliverables and activity for detail view */
function generateMockDetail(taskId: string): ApprovalDetail | undefined {
	const MOCK_DETAILS: Record<string, Omit<ApprovalDetail, "taskId" | "taskTitle" | "taskDescription" | "agentId" | "agentName" | "priority" | "deliverableCount" | "submittedAt" | "signOffStatus">> = {
		"appr-001": {
			deliverables: [
				{
					id: "del-m-001",
					name: "migration-v2.sql",
					type: "code",
					content: `-- Migration: users table normalization
ALTER TABLE users ADD COLUMN org_id UUID REFERENCES orgs(id);
CREATE INDEX idx_users_org ON users(org_id);

-- Migrate existing data
UPDATE users SET org_id = (
  SELECT id FROM orgs WHERE orgs.legacy_id = users.org_legacy_id
);

-- Add rollback procedure
CREATE OR REPLACE FUNCTION rollback_migration_v2()
RETURNS void AS $$
BEGIN
  ALTER TABLE users DROP COLUMN IF EXISTS org_id;
END;
$$ LANGUAGE plpgsql;`,
					url: undefined,
					size: 4200,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 30 * 60_000), action: "Submitted for review", actor: "Data Agent" },
				{ timestamp: new Date(Date.now() - 45 * 60_000), action: "Migration script tested successfully", actor: "Data Agent" },
				{ timestamp: new Date(Date.now() - 2 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
		"appr-002": {
			deliverables: [
				{
					id: "del-s-001",
					name: "security-audit-report.pdf",
					type: "file",
					content: undefined,
					url: "/files/security-audit-report.pdf",
					size: 245_000,
				},
				{
					id: "del-s-002",
					name: "vulnerability-fixes.ts",
					type: "code",
					content: `// CSRF token validation middleware
export function csrfProtection(req: Request) {
  const token = req.headers.get("x-csrf-token");
  const sessionToken = getSessionCsrf(req);
  if (!token || token !== sessionToken) {
    throw new Error("CSRF token mismatch");
  }
}

// Rate limiter configuration
export const rateLimiter = new TokenBucket({
  capacity: 100,
  refillRate: 10, // per second
});`,
					url: undefined,
					size: 1800,
				},
				{
					id: "del-s-003",
					name: "OWASP Compliance Checklist",
					type: "link",
					content: undefined,
					url: "https://owasp.org/www-project-web-security-testing-guide/",
					size: undefined,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 2 * 60 * 60_000), action: "Submitted for review", actor: "Research Agent" },
				{ timestamp: new Date(Date.now() - 3 * 60 * 60_000), action: "Report finalized", actor: "Research Agent" },
				{ timestamp: new Date(Date.now() - 6 * 60 * 60_000), action: "Audit scan completed", actor: "Research Agent" },
				{ timestamp: new Date(Date.now() - 8 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
		"appr-003": {
			deliverables: [
				{
					id: "del-p-001",
					name: "query-optimization.ts",
					type: "code",
					content: `// Optimized dashboard stats query
export async function getDashboardStats(orgId: string) {
  return db.execute(sql\`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') as active_agents,
      COUNT(*) FILTER (WHERE status = 'idle') as idle_agents,
      AVG(response_time_ms) as avg_response_time,
      SUM(tokens_used) as total_tokens
    FROM agent_metrics
    WHERE org_id = \${orgId}
      AND recorded_at > NOW() - INTERVAL '24 hours'
  \`);
}`,
					url: undefined,
					size: 980,
				},
				{
					id: "del-p-002",
					name: "redis-cache-layer.ts",
					type: "code",
					content: `import { redis } from "@/shared/lib/redis";

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const result = await queryFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(result));
  return result;
}`,
					url: undefined,
					size: 720,
				},
				{
					id: "del-p-003",
					name: "benchmark-results.json",
					type: "file",
					content: undefined,
					url: "/files/benchmark-results.json",
					size: 12_400,
				},
				{
					id: "del-p-004",
					name: "Performance Dashboard",
					type: "link",
					content: undefined,
					url: "https://grafana.internal/d/perf-dashboard",
					size: undefined,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 4 * 60 * 60_000), action: "Submitted for review", actor: "Code Agent" },
				{ timestamp: new Date(Date.now() - 5 * 60 * 60_000), action: "Benchmarks completed", actor: "Code Agent" },
				{ timestamp: new Date(Date.now() - 12 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
		"appr-004": {
			deliverables: [
				{
					id: "del-a-001",
					name: "agent-config-api.ts",
					type: "code",
					content: `// Agent configuration CRUD endpoints
export const agentConfigRouter = createRouter()
  .get("/agents/:id/config", getAgentConfig)
  .put("/agents/:id/config", updateAgentConfig);`,
					url: undefined,
					size: 3200,
				},
				{
					id: "del-a-002",
					name: "API Documentation",
					type: "link",
					content: undefined,
					url: "https://docs.internal/api/agent-config",
					size: undefined,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 8 * 60 * 60_000), action: "Submitted for review", actor: "Code Agent" },
				{ timestamp: new Date(Date.now() - 10 * 60 * 60_000), action: "Tests passing", actor: "Code Agent" },
				{ timestamp: new Date(Date.now() - 16 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
		"appr-005": {
			deliverables: [
				{
					id: "del-d-001",
					name: "user-guide.md",
					type: "file",
					content: undefined,
					url: "/files/user-guide.md",
					size: 28_500,
				},
				{
					id: "del-d-002",
					name: "getting-started.md",
					type: "file",
					content: undefined,
					url: "/files/getting-started.md",
					size: 12_300,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 24 * 60 * 60_000), action: "Submitted for review", actor: "Writer Agent" },
				{ timestamp: new Date(Date.now() - 26 * 60 * 60_000), action: "Final draft completed", actor: "Writer Agent" },
				{ timestamp: new Date(Date.now() - 30 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
		"appr-006": {
			deliverables: [
				{
					id: "del-t-001",
					name: "channel-pairing.test.ts",
					type: "code",
					content: `describe("Channel Pairing", () => {
  it("should pair WhatsApp channel with agent", async () => {
    const result = await pairChannel("whatsapp", "agent-001");
    expect(result.status).toBe("paired");
  });

  it("should reject duplicate pairing", async () => {
    await expect(pairChannel("whatsapp", "agent-001"))
      .rejects.toThrow("Already paired");
  });
});`,
					url: undefined,
					size: 5400,
				},
				{
					id: "del-t-002",
					name: "routing.test.ts",
					type: "code",
					content: `describe("Message Routing", () => {
  it("should route to correct agent based on channel", () => {
    const agent = routeMessage({ channel: "telegram", content: "hello" });
    expect(agent.id).toBe("agent-telegram");
  });
});`,
					url: undefined,
					size: 3200,
				},
				{
					id: "del-t-003",
					name: "Test Coverage Report",
					type: "link",
					content: undefined,
					url: "https://ci.internal/coverage/channel-tests",
					size: undefined,
				},
			],
			taskActivity: [
				{ timestamp: new Date(Date.now() - 36 * 60 * 60_000), action: "Submitted for review", actor: "QA Agent" },
				{ timestamp: new Date(Date.now() - 37 * 60 * 60_000), action: "All tests passing (42/42)", actor: "QA Agent" },
				{ timestamp: new Date(Date.now() - 40 * 60 * 60_000), action: "Task assigned", actor: "System" },
			],
		},
	};

	return MOCK_DETAILS[taskId]
		? { ...({} as ApprovalDetail), ...MOCK_DETAILS[taskId] }
		: undefined;
}

interface ApprovalDetailViewProps {
	taskId: string;
}

export function ApprovalDetailView({ taskId }: ApprovalDetailViewProps) {
	const router = useRouter();
	const { data: approvals, isLoading } = useApprovals();

	const detail = useMemo<ApprovalDetail | undefined>(() => {
		if (!approvals) return undefined;
		const item = approvals.find((a) => a.taskId === taskId);
		if (!item) return undefined;

		const mockExtras = generateMockDetail(taskId);
		if (!mockExtras) return undefined;

		return {
			...item,
			deliverables: mockExtras.deliverables,
			taskActivity: mockExtras.taskActivity,
		};
	}, [approvals, taskId]);

	if (isLoading) {
		return (
			<div className="space-y-0">
				<PageHeader
					title="Loading..."
					breadcrumbs={[
						{ label: "Approvals", href: "/approvals" },
						{ label: "..." },
					]}
				/>
				<SkeletonDetail />
			</div>
		);
	}

	if (!detail) {
		return (
			<div className="space-y-0">
				<PageHeader
					title="Not Found"
					breadcrumbs={[
						{ label: "Approvals", href: "/approvals" },
						{ label: "Not Found" },
					]}
				/>
				<EmptyState
					title="Approval not found"
					description="This approval may have already been reviewed or does not exist."
					action={{
						label: "Back to Approvals",
						onClick: () => router.push("/approvals"),
					}}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={detail.taskTitle}
				breadcrumbs={[
					{ label: "Approvals", href: "/approvals" },
					{ label: detail.taskTitle },
				]}
			/>

			<ApprovalReview detail={detail} />

			<ApprovalActionPanel
				taskId={taskId}
				onComplete={() => router.push("/approvals")}
			/>
		</div>
	);
}
