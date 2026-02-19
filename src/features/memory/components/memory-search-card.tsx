"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { MemorySearchResult } from "@/entities/memory";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/shared/ui/card";

const AGENT_COLORS: Record<string, string> = {
	"agent-atlas": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	"agent-nova": "bg-purple-500/15 text-purple-700 dark:text-purple-400",
	"agent-cipher": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
	"agent-echo": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const MEMORY_TYPE_LABELS: Record<string, string> = {
	persistent: "Persistent",
	daily: "Daily",
	conversation: "Conversation",
};

function RelevanceDots({ score }: { score: number }) {
	const filled = Math.round(score * 5);
	return (
		<div className="flex items-center gap-0.5" title={`Relevance: ${Math.round(score * 100)}%`}>
			{Array.from({ length: 5 }).map((_, i) => (
				<span
					key={`dot-${i.toString()}`}
					className={cn(
						"size-1.5 rounded-full",
						i < filled ? "bg-primary" : "bg-muted-foreground/25",
					)}
				/>
			))}
		</div>
	);
}

interface MemorySearchCardProps {
	result: MemorySearchResult;
	query: string;
}

export function MemorySearchCard({ result, query }: MemorySearchCardProps) {
	const agentColor = AGENT_COLORS[result.agentId] ?? "bg-muted text-foreground";

	// Highlight matched text in snippet
	function highlightSnippet(text: string): React.ReactNode {
		if (!query) return text;

		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const parts: React.ReactNode[] = [];
		let lastIndex = 0;

		let searchFrom = 0;
		while (searchFrom < text.length) {
			const matchIdx = lowerText.indexOf(lowerQuery, searchFrom);
			if (matchIdx === -1) break;

			if (matchIdx > lastIndex) {
				parts.push(text.slice(lastIndex, matchIdx));
			}
			parts.push(
				<mark
					key={`match-${matchIdx.toString()}`}
					className="bg-yellow-200 dark:bg-yellow-900 text-foreground rounded-sm px-0.5"
				>
					{text.slice(matchIdx, matchIdx + query.length)}
				</mark>,
			);
			lastIndex = matchIdx + query.length;
			searchFrom = lastIndex;
		}

		if (lastIndex < text.length) {
			parts.push(text.slice(lastIndex));
		}

		return parts.length > 0 ? parts : text;
	}

	return (
		<Link href="/memory" className="block">
			<Card className="transition-colors hover:border-primary/30 hover:bg-accent/30 py-4 gap-3">
				<CardHeader className="px-4 py-0">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge className={cn("text-[10px] border-0", agentColor)}>
							{result.agentName}
						</Badge>
						<Badge variant="outline" className="text-[10px]">
							{MEMORY_TYPE_LABELS[result.memoryType] ?? result.memoryType}
						</Badge>
						<div className="ml-auto">
							<RelevanceDots score={result.relevanceScore} />
						</div>
					</div>
				</CardHeader>

				<CardContent className="px-4 py-0">
					<p className="text-sm leading-relaxed text-foreground/90">
						{result.beforeContext && (
							<span className="text-muted-foreground">...{result.beforeContext}</span>
						)}
						{highlightSnippet(result.snippet)}
						{result.afterContext && (
							<span className="text-muted-foreground">{result.afterContext}...</span>
						)}
					</p>
				</CardContent>

				<CardFooter className="px-4 py-0 flex items-center justify-between">
					<span className="font-mono text-xs text-muted-foreground truncate">
						{result.filePath}
					</span>
					<span className="text-[10px] text-muted-foreground shrink-0 ml-2">
						{formatDistanceToNow(result.lastModified, { addSuffix: true })}
					</span>
				</CardFooter>
			</Card>
		</Link>
	);
}
