"use client";

import { format } from "date-fns";
import { Shield, User } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import type { AuditLogEntry } from "../api/use-audit-log";

interface AuditDetailPanelProps {
	entry: AuditLogEntry;
}

/** Get keys that differ between two objects */
function getChangedKeys(
	before: Record<string, unknown>,
	after: Record<string, unknown>,
): Set<string> {
	const changed = new Set<string>();
	const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
	for (const key of allKeys) {
		if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
			changed.add(key);
		}
	}
	return changed;
}

/** Render JSON with highlighted changed lines */
function JsonBlock({
	data,
	changedKeys,
	variant,
}: {
	data: Record<string, unknown>;
	changedKeys: Set<string>;
	variant: "before" | "after";
}) {
	const lines = JSON.stringify(data, null, 2).split("\n");

	return (
		<pre className="overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
			{lines.map((line, i) => {
				const isChanged = [...changedKeys].some((key) =>
					line.includes(`"${key}"`),
				);
				return (
					<div
						key={`${variant}-${i.toString()}`}
						className={cn(
							isChanged &&
								variant === "before" &&
								"bg-red-500/10 text-red-700 dark:text-red-400",
							isChanged &&
								variant === "after" &&
								"bg-green-500/10 text-green-700 dark:text-green-400",
						)}
					>
						{line}
					</div>
				);
			})}
		</pre>
	);
}

export function AuditDetailPanel({ entry }: AuditDetailPanelProps) {
	const changedKeys =
		entry.beforeState && entry.afterState
			? getChangedKeys(entry.beforeState, entry.afterState)
			: new Set<string>();

	return (
		<div className="border-t bg-muted/50 px-6 py-4 space-y-4">
			{/* Full timestamp and actor */}
			<div className="flex flex-wrap items-center gap-4 text-sm">
				<div className="flex items-center gap-1.5">
					<User className="size-3.5 text-muted-foreground" />
					<span className="font-medium">{entry.actor}</span>
				</div>
				<span className="text-muted-foreground">
					{format(entry.timestamp, "yyyy-MM-dd HH:mm:ss")}
				</span>
				<span className="text-muted-foreground">
					Resource:{" "}
					<span className="font-mono text-foreground">
						{entry.resourceType}/{entry.resourceId}
					</span>
				</span>
			</div>

			{/* Before/After diff */}
			{entry.action === "update" &&
				entry.beforeState &&
				entry.afterState && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">
							Changes
						</p>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								<p className="mb-1 text-xs text-muted-foreground">
									Before
								</p>
								<JsonBlock
									data={entry.beforeState}
									changedKeys={changedKeys}
									variant="before"
								/>
							</div>
							<div>
								<p className="mb-1 text-xs text-muted-foreground">
									After
								</p>
								<JsonBlock
									data={entry.afterState}
									changedKeys={changedKeys}
									variant="after"
								/>
							</div>
						</div>
					</div>
				)}

			{/* Non-update entries with afterState (creates, approvals) */}
			{entry.action !== "update" && entry.afterState && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						Result State
					</p>
					<pre className="overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
						{JSON.stringify(entry.afterState, null, 2)}
					</pre>
				</div>
			)}

			{/* Non-update entries with beforeState (deletes) */}
			{entry.action !== "update" &&
				!entry.afterState &&
				entry.beforeState && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">
							Previous State
						</p>
						<pre className="overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
							{JSON.stringify(entry.beforeState, null, 2)}
						</pre>
					</div>
				)}

			{/* Metadata */}
			{(entry.metadata || entry.ipAddress || entry.correlationId) && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						Metadata
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
						{entry.ipAddress && (
							<span>
								<span className="text-muted-foreground">IP:</span>{" "}
								<span className="font-mono">{entry.ipAddress}</span>
							</span>
						)}
						{entry.correlationId && (
							<span>
								<span className="text-muted-foreground">Correlation:</span>{" "}
								<span className="font-mono">{entry.correlationId}</span>
							</span>
						)}
						{entry.metadata &&
							Object.entries(entry.metadata).map(([key, value]) => (
								<span key={key}>
									<span className="text-muted-foreground">{key}:</span>{" "}
									<span className="font-mono">
										{typeof value === "string"
											? value
											: JSON.stringify(value)}
									</span>
								</span>
							))}
					</div>
				</div>
			)}

			{/* Hash chain verification */}
			<div className="flex items-center gap-1.5 text-xs">
				<Shield className="size-3.5 text-green-600 dark:text-green-400" />
				<Badge variant="outline" className="text-xs px-1.5 py-0">
					Verified
				</Badge>
				{entry.hashChainPrev && (
					<span className="font-mono text-muted-foreground">
						prev: {entry.hashChainPrev}
					</span>
				)}
			</div>
		</div>
	);
}
