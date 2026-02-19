"use client";

import { formatDistanceStrict } from "date-fns";
import { Coins, Clock, MessageSquare, Wrench } from "lucide-react";
import type { SessionSummary } from "@/entities/session";
import { Card, CardContent } from "@/shared/ui/card";

function formatTokens(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toLocaleString("en-US");
}

function formatCost(cost: number): string {
	return `$${cost.toFixed(2)}`;
}

function formatDuration(ms: number): string {
	const now = new Date();
	const past = new Date(now.getTime() - ms);
	return formatDistanceStrict(past, now);
}

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub: string | undefined;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
	return (
		<Card className="py-4 gap-3">
			<CardContent className="flex items-start gap-3">
				<div className="rounded-md bg-muted p-2 text-muted-foreground">
					{icon}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs text-muted-foreground">{label}</p>
					<p className="text-lg font-semibold leading-tight">{value}</p>
					{sub && (
						<p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface SessionSummaryHeaderProps {
	summary: SessionSummary;
}

export function SessionSummaryHeader({ summary }: SessionSummaryHeaderProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard
				icon={<Coins className="size-4" />}
				label="Total Tokens"
				value={formatTokens(summary.totalTokens)}
				sub={`${formatTokens(summary.inputTokens)} in / ${formatTokens(summary.outputTokens)} out`}
			/>
			<StatCard
				icon={<Coins className="size-4" />}
				label="Cost"
				value={formatCost(summary.estimatedCost)}
				sub={undefined}
			/>
			<StatCard
				icon={<Clock className="size-4" />}
				label="Duration"
				value={formatDuration(summary.duration)}
				sub={undefined}
			/>
			<StatCard
				icon={<MessageSquare className="size-4" />}
				label="Messages"
				value={`${summary.messageCount}`}
				sub={`${summary.toolCallCount} tool call${summary.toolCallCount !== 1 ? "s" : ""}`}
			/>
		</div>
	);
}
