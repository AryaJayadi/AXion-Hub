"use client";

import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
	GitPullRequest,
	TestTube,
	MessageSquare,
	Mail,
	Database,
	FileSpreadsheet,
	Calendar,
	Github,
	ShieldCheck,
	LayoutGrid,
	Puzzle,
} from "lucide-react";
import type { Skill } from "@/entities/skill";
import { StatusBadge } from "@/shared/ui/status-badge";

/** Map lucide icon name strings to actual icon components */
const ICON_MAP: Record<string, LucideIcon> = {
	"git-pull-request": GitPullRequest,
	"test-tube": TestTube,
	"message-square": MessageSquare,
	mail: Mail,
	database: Database,
	"file-spreadsheet": FileSpreadsheet,
	calendar: Calendar,
	github: Github,
	"shield-check": ShieldCheck,
	"layout-grid": LayoutGrid,
	puzzle: Puzzle,
};

/** Map skill status to StatusBadge status string */
const STATUS_MAP: Record<Skill["status"], string> = {
	enabled: "online",
	disabled: "offline",
	update_available: "warning",
};

const STATUS_LABEL_MAP: Record<Skill["status"], string> = {
	enabled: "Enabled",
	disabled: "Disabled",
	update_available: "Update Available",
};

interface SkillCardProps {
	skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
	const router = useRouter();
	const Icon = ICON_MAP[skill.icon] ?? Puzzle;

	return (
		<button
			type="button"
			onClick={() => router.push(`/skills/${skill.id}`)}
			className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer"
		>
			<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
				<Icon className="size-5 text-muted-foreground" />
			</div>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex items-center justify-between gap-2">
					<h3 className="truncate text-sm font-semibold">{skill.name}</h3>
					<StatusBadge
						status={STATUS_MAP[skill.status]}
						label={STATUS_LABEL_MAP[skill.status]}
						size="sm"
					/>
				</div>
				<p className="line-clamp-1 text-xs text-muted-foreground">
					{skill.description}
				</p>
				<p className="text-xs text-muted-foreground/70">
					v{skill.version} &middot; {skill.agentCount} agent{skill.agentCount !== 1 ? "s" : ""}
				</p>
			</div>
		</button>
	);
}
