"use client";

import { useRef, useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import type { AgentStatus } from "@/entities/agent";
import { useDashboardStore } from "@/features/dashboard";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/shared/lib/cn";

const STATUS_ORDER: AgentStatus[] = ["online", "working", "idle", "error", "offline"];

/**
 * Agent count widget with animated numbers and pulsing status badges.
 *
 * Shows total agent count as a large animated number and a breakdown
 * by status with StatusBadge indicators. Badges pulse briefly when
 * their count changes.
 */
export function AgentCountWidget() {
	const agentCounts = useDashboardStore((s) => s.agentCounts);
	const totalAgents = useDashboardStore((s) => s.totalAgents);

	const prevCountsRef = useRef<Record<AgentStatus, number>>(agentCounts);
	const [pulsingStatuses, setPulsingStatuses] = useState<Set<AgentStatus>>(
		new Set(),
	);

	useEffect(() => {
		const prev = prevCountsRef.current;
		const changed = new Set<AgentStatus>();

		for (const status of STATUS_ORDER) {
			if (prev[status] !== agentCounts[status]) {
				changed.add(status);
			}
		}

		if (changed.size > 0) {
			setPulsingStatuses(changed);
			const timeout = setTimeout(() => {
				setPulsingStatuses(new Set());
			}, 600);
			return () => clearTimeout(timeout);
		}

		prevCountsRef.current = agentCounts;
	}, [agentCounts]);

	// Update ref after effect runs
	useEffect(() => {
		prevCountsRef.current = agentCounts;
	});

	return (
		<div className="flex flex-col gap-4">
			{/* Total count */}
			<div className="flex items-baseline gap-2">
				<NumberFlow
					value={totalAgents}
					className="text-3xl font-bold tabular-nums"
				/>
				<span className="text-sm text-muted-foreground">agents</span>
			</div>

			{/* Breakdown by status */}
			<div className="flex flex-col gap-2">
				{STATUS_ORDER.map((status) => (
					<div
						key={status}
						className={cn(
							"flex items-center justify-between transition-all",
							pulsingStatuses.has(status) && "animate-pulse",
						)}
					>
						<StatusBadge status={status} size="sm" />
						<NumberFlow
							value={agentCounts[status]}
							className="text-sm font-medium tabular-nums"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
