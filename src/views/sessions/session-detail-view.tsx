"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSessionDetail } from "@/features/sessions/api/use-session-detail";
import { SessionSummaryHeader } from "@/features/sessions/components/session-summary-header";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";

interface SessionDetailViewProps {
	sessionId: string;
}

export function SessionDetailView({ sessionId }: SessionDetailViewProps) {
	const { data: detail, isLoading } = useSessionDetail(sessionId);

	if (isLoading) {
		return (
			<div>
				<PageHeader
					title="Session Detail"
					breadcrumbs={[
						{ label: "Sessions", href: "/sessions" },
						{ label: sessionId },
					]}
				/>
				<SkeletonDetail />
			</div>
		);
	}

	if (!detail) {
		return (
			<div>
				<PageHeader
					title="Session Detail"
					breadcrumbs={[
						{ label: "Sessions", href: "/sessions" },
						{ label: sessionId },
					]}
				/>
				<EmptyState
					title="Session not found"
					description="The session you are looking for does not exist or has been removed."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Session Detail"
				breadcrumbs={[
					{ label: "Sessions", href: "/sessions" },
					{ label: detail.session.agentName },
					{ label: `Session ${sessionId.slice(0, 8)}` },
				]}
				actions={
					<Button asChild variant="outline" size="sm" className="gap-2">
						<Link href={`/sessions/${sessionId}/transcript`}>
							View Transcript
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				}
			/>

			<SessionSummaryHeader summary={detail.summary} />

			<div className="rounded-lg border border-border bg-card p-4">
				<dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
					<div>
						<dt className="text-muted-foreground">Agent</dt>
						<dd className="font-medium">{detail.session.agentName}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Model</dt>
						<dd className="font-mono">{detail.session.model}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Status</dt>
						<dd className="capitalize">{detail.session.status}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Compactions</dt>
						<dd>{detail.session.compactionCount}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
