"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { AgentTool } from "@/entities/agent";

const MOCK_TOOLS: AgentTool[] = [
	{ name: "Read", description: "Read files from the filesystem", allowed: true, elevated: false },
	{ name: "Write", description: "Write files to the filesystem", allowed: true, elevated: false },
	{ name: "Bash", description: "Execute shell commands", allowed: true, elevated: true },
	{ name: "Grep", description: "Search file contents with regex", allowed: true, elevated: false },
	{ name: "Glob", description: "Find files by pattern matching", allowed: true, elevated: false },
	{
		name: "WebFetch",
		description: "Fetch content from web URLs",
		allowed: true,
		elevated: false,
	},
	{
		name: "WebSearch",
		description: "Search the web for information",
		allowed: false,
		elevated: false,
	},
	{ name: "Edit", description: "Make precise edits to existing files", allowed: true, elevated: false },
	{
		name: "Task",
		description: "Spawn sub-tasks for parallel execution",
		allowed: false,
		elevated: false,
	},
	{
		name: "TodoWrite",
		description: "Manage a task checklist for tracking progress",
		allowed: false,
		elevated: false,
	},
];

interface ToolRowProps {
	tool: AgentTool;
	onToggleAllowed: (name: string, allowed: boolean) => void;
	onToggleElevated: (name: string, elevated: boolean) => void;
}

function ToolRow({ tool, onToggleAllowed, onToggleElevated }: ToolRowProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="border-b border-border last:border-b-0">
			<div className="flex items-center gap-3 px-4 py-3">
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="text-muted-foreground hover:text-foreground transition-colors"
					aria-label={expanded ? "Collapse" : "Expand"}
				>
					{expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
				</button>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium">{tool.name}</p>
					<p className="text-xs text-muted-foreground truncate">{tool.description}</p>
				</div>
				<Switch
					checked={tool.allowed}
					onCheckedChange={(checked) => onToggleAllowed(tool.name, checked)}
					aria-label={`Toggle ${tool.name}`}
				/>
			</div>
			{expanded && (
				<div className="px-4 pb-3 pl-11">
					<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
						<Checkbox
							checked={tool.elevated}
							onCheckedChange={(checked) => onToggleElevated(tool.name, checked === true)}
						/>
						Elevated access (run with elevated permissions)
					</label>
				</div>
			)}
		</div>
	);
}

export function AgentToolsConfig() {
	const [tools, setTools] = useState<AgentTool[]>(MOCK_TOOLS);

	const handleToggleAllowed = (name: string, allowed: boolean) => {
		setTools((prev) => prev.map((t) => (t.name === name ? { ...t, allowed } : t)));
		toast.success(allowed ? `${name} allowed` : `${name} denied`);
	};

	const handleToggleElevated = (name: string, elevated: boolean) => {
		setTools((prev) => prev.map((t) => (t.name === name ? { ...t, elevated } : t)));
		toast.success(elevated ? `${name} elevated access enabled` : `${name} elevated access disabled`);
	};

	const allowedTools = tools.filter((t) => t.allowed);
	const deniedTools = tools.filter((t) => !t.allowed);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">
						Allowed Tools ({allowedTools.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{allowedTools.length === 0 ? (
						<p className="px-4 pb-4 text-xs text-muted-foreground">No tools allowed</p>
					) : (
						allowedTools.map((tool) => (
							<ToolRow
								key={tool.name}
								tool={tool}
								onToggleAllowed={handleToggleAllowed}
								onToggleElevated={handleToggleElevated}
							/>
						))
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">
						Denied Tools ({deniedTools.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{deniedTools.length === 0 ? (
						<p className="px-4 pb-4 text-xs text-muted-foreground">No tools denied</p>
					) : (
						deniedTools.map((tool) => (
							<ToolRow
								key={tool.name}
								tool={tool}
								onToggleAllowed={handleToggleAllowed}
								onToggleElevated={handleToggleElevated}
							/>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
