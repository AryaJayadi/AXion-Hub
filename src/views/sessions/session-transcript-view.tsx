"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { List, GitBranch } from "lucide-react";
import { useSessionTranscript } from "@/features/sessions/api/use-session-transcript";
import { TranscriptThread } from "@/features/sessions/components/transcript-thread";
import { TranscriptTree } from "@/features/sessions/components/transcript-tree";
import { SkeletonList } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/shared/ui/toggle-group";

const VIEW_OPTIONS = ["thread", "tree"] as const;

interface SessionTranscriptViewProps {
	sessionId: string;
}

export function SessionTranscriptView({
	sessionId,
}: SessionTranscriptViewProps) {
	const { data: messages, isLoading } = useSessionTranscript(sessionId);
	const [view, setView] = useQueryState(
		"view",
		parseAsStringLiteral(VIEW_OPTIONS).withDefault("thread"),
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Transcript"
				breadcrumbs={[
					{ label: "Sessions", href: "/sessions" },
					{
						label: `Session ${sessionId.slice(0, 8)}`,
						href: `/sessions/${sessionId}`,
					},
					{ label: "Transcript" },
				]}
				actions={
					<ToggleGroup
						type="single"
						value={view}
						onValueChange={(v) => {
							if (v) setView(v as "thread" | "tree");
						}}
						variant="outline"
						size="sm"
					>
						<ToggleGroupItem value="thread" className="gap-1.5">
							<List className="size-3.5" />
							Flat
						</ToggleGroupItem>
						<ToggleGroupItem value="tree" className="gap-1.5">
							<GitBranch className="size-3.5" />
							Tree
						</ToggleGroupItem>
					</ToggleGroup>
				}
			/>

			{isLoading ? (
				<SkeletonList items={8} />
			) : view === "tree" ? (
				<TranscriptTree messages={messages ?? []} />
			) : (
				<TranscriptThread messages={messages ?? []} />
			)}
		</div>
	);
}
