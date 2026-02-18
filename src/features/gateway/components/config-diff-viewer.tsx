"use client";

import type { ConfigDiff } from "@/entities/gateway-config";
import { Badge } from "@/shared/ui/badge";
import { countDiffsBySection } from "../lib/config-diff";
import { useConfigDraftStore } from "../model/config-draft-store";

function formatValue(value: unknown): string {
	if (value === undefined) return "undefined";
	if (value === null) return "null";
	if (typeof value === "string") return `"${value}"`;
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function DiffRow({ diff }: { diff: ConfigDiff }) {
	const colorMap = {
		added: "text-green-600 dark:text-green-400",
		removed: "text-red-600 dark:text-red-400",
		changed: "text-yellow-600 dark:text-yellow-400",
	};

	const badgeVariant = {
		added: "default" as const,
		removed: "destructive" as const,
		changed: "secondary" as const,
	};

	return (
		<div className="flex items-start gap-3 rounded-md border p-3 text-sm">
			<Badge variant={badgeVariant[diff.type]} className="shrink-0 text-xs">
				{diff.type}
			</Badge>
			<div className="min-w-0 flex-1">
				<p className="font-mono text-xs text-muted-foreground">{diff.path}</p>
				<div className={colorMap[diff.type]}>
					{diff.type === "changed" && (
						<>
							<p className="text-red-600 dark:text-red-400">
								- {formatValue(diff.oldValue)}
							</p>
							<p className="text-green-600 dark:text-green-400">
								+ {formatValue(diff.newValue)}
							</p>
						</>
					)}
					{diff.type === "added" && (
						<p>+ {formatValue(diff.newValue)}</p>
					)}
					{diff.type === "removed" && (
						<p>- {formatValue(diff.oldValue)}</p>
					)}
				</div>
			</div>
		</div>
	);
}

export function ConfigDiffViewer() {
	const diffs = useConfigDraftStore((s) => s.getDiffs());

	if (diffs.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No changes detected
			</p>
		);
	}

	const sectionCounts = countDiffsBySection(diffs);
	const sectionCount = Object.keys(sectionCounts).length;

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				{diffs.length} change{diffs.length !== 1 ? "s" : ""} across{" "}
				{sectionCount} section{sectionCount !== 1 ? "s" : ""}
			</p>
			<div className="space-y-2">
				{diffs.map((diff) => (
					<DiffRow key={diff.path} diff={diff} />
				))}
			</div>
		</div>
	);
}
