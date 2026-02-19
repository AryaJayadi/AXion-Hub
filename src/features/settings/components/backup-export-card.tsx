"use client";

import { useState } from "react";
import { Settings, MessageSquare, Archive, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

// ---------------------------------------------------------------------------
// Export option definitions
// ---------------------------------------------------------------------------

interface ExportOption {
	id: string;
	title: string;
	description: string;
	icon: LucideIcon;
	estimatedSize: string;
	filename: string;
	generateData: () => Record<string, unknown>;
}

const EXPORT_OPTIONS: ExportOption[] = [
	{
		id: "config",
		title: "Configuration Export",
		description:
			"Download workspace settings, preferences, and theme configuration as JSON.",
		icon: Settings,
		estimatedSize: "~2 KB",
		filename: "axion-config",
		generateData: () => ({
			exportedAt: new Date().toISOString(),
			type: "config",
			data: {
				appName: "AXion Hub",
				timezone: "UTC",
				theme: "system",
				language: "en",
			},
		}),
	},
	{
		id: "sessions",
		title: "Sessions Export",
		description:
			"Download agent session data including transcripts and metadata as JSON.",
		icon: MessageSquare,
		estimatedSize: "~50 KB",
		filename: "axion-sessions",
		generateData: () => ({
			exportedAt: new Date().toISOString(),
			type: "sessions",
			data: {
				sessions: [
					{
						id: "sess-001",
						agentId: "agent-alpha",
						startedAt: "2026-02-18T10:00:00Z",
						status: "completed",
						messageCount: 42,
					},
					{
						id: "sess-002",
						agentId: "agent-beta",
						startedAt: "2026-02-19T08:30:00Z",
						status: "active",
						messageCount: 15,
					},
				],
				total: 2,
			},
		}),
	},
	{
		id: "workspace",
		title: "Full Workspace Export",
		description:
			"Download a comprehensive export of all workspace data including config, agents, and sessions.",
		icon: Archive,
		estimatedSize: "~200 KB",
		filename: "axion-workspace",
		generateData: () => ({
			exportedAt: new Date().toISOString(),
			type: "workspace",
			data: {
				config: {
					appName: "AXion Hub",
					timezone: "UTC",
					theme: "system",
					language: "en",
				},
				agents: [
					{
						id: "agent-alpha",
						name: "Alpha",
						status: "online",
						model: "claude-sonnet-4",
					},
					{
						id: "agent-beta",
						name: "Beta",
						status: "idle",
						model: "gpt-4o",
					},
				],
				sessions: [
					{
						id: "sess-001",
						agentId: "agent-alpha",
						status: "completed",
						messageCount: 42,
					},
					{
						id: "sess-002",
						agentId: "agent-beta",
						status: "active",
						messageCount: 15,
					},
				],
			},
		}),
	},
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BackupExportCard() {
	return (
		<div className="space-y-6">
			{EXPORT_OPTIONS.map((option) => (
				<ExportOptionCard key={option.id} option={option} />
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Single export option card
// ---------------------------------------------------------------------------

function ExportOptionCard({ option }: { option: ExportOption }) {
	const [isExporting, setIsExporting] = useState(false);
	const Icon = option.icon;

	async function handleExport() {
		setIsExporting(true);
		toast.success("Export started");

		try {
			// Small delay to simulate processing
			await new Promise((resolve) => setTimeout(resolve, 300));

			const data = option.generateData();
			const json = JSON.stringify(data, null, 2);
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const filename = `${option.filename}-${timestamp}.json`;

			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("Export downloaded");
		} catch {
			toast.error("Export failed");
		} finally {
			setIsExporting(false);
		}
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
					<Icon className="size-5" />
				</div>
				<div className="flex-1 space-y-1">
					<CardTitle className="text-base">{option.title}</CardTitle>
					<CardDescription className="text-xs">
						{option.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						Estimated size: {option.estimatedSize}
					</span>
					<Button
						size="sm"
						variant="outline"
						onClick={handleExport}
						disabled={isExporting}
					>
						{isExporting && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						{option.id === "workspace" ? "Export Everything" : `Export ${option.title.split(" ")[0]}`}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
