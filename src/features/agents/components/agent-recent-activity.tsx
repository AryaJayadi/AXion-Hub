"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface ActivityEntry {
	id: string;
	timestamp: Date;
	eventType: "tool_call" | "message" | "error" | "status_change" | "compaction";
	summary: string;
}

const EVENT_TYPE_COLORS: Record<ActivityEntry["eventType"], string> = {
	tool_call: "bg-blue-500",
	message: "bg-green-500",
	error: "bg-red-500",
	status_change: "bg-yellow-500",
	compaction: "bg-purple-500",
};

// Mock recent activity data
const MOCK_ACTIVITY: ActivityEntry[] = [
	{
		id: "act-1",
		timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
		eventType: "tool_call",
		summary: "Executed Read on src/components/header.tsx",
	},
	{
		id: "act-2",
		timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
		eventType: "message",
		summary: "Responded to user query about authentication",
	},
	{
		id: "act-3",
		timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
		eventType: "tool_call",
		summary: "Executed Bash: bun run build",
	},
	{
		id: "act-4",
		timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
		eventType: "status_change",
		summary: "Status changed from idle to working",
	},
	{
		id: "act-5",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
		eventType: "compaction",
		summary: "Session compacted: 12,450 tokens reclaimed",
	},
];

interface AgentRecentActivityProps {
	agentId: string;
}

export function AgentRecentActivity({ agentId }: AgentRecentActivityProps) {
	// TODO: Replace with useAgentLogs(agentId, { limit: 5 }) when wired
	const activities = MOCK_ACTIVITY;

	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity) => (
						<div key={activity.id} className="flex items-start gap-3">
							<div
								className={cn(
									"mt-1.5 size-2 shrink-0 rounded-full",
									EVENT_TYPE_COLORS[activity.eventType],
								)}
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm truncate">{activity.summary}</p>
								<p className="text-xs text-muted-foreground">
									{formatDistanceToNow(activity.timestamp, {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>
					))}
				</div>

				<Link
					href={`/agents/${agentId}/logs`}
					className="mt-4 block text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					View all activity →
				</Link>
			</CardContent>
		</Card>
	);
}
