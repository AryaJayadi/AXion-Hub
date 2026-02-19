"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useSkillDetail } from "@/features/skills/api/use-skill-detail";
import { SkillConfigEditor } from "@/features/skills/components/skill-config-editor";
import { SkillAgentToggles } from "@/features/skills/components/skill-agent-toggles";

/**
 * Dynamic import of markdown editor in preview mode.
 * SSR disabled -- same pattern as workspace code-editor.
 */
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
	ssr: false,
	loading: () => <Skeleton className="h-64 w-full" />,
});

/** Map skill status to StatusBadge status string */
const STATUS_MAP: Record<string, string> = {
	enabled: "online",
	disabled: "offline",
	update_available: "warning",
};

const STATUS_LABEL_MAP: Record<string, string> = {
	enabled: "Enabled",
	disabled: "Disabled",
	update_available: "Update Available",
};

interface SkillDetailViewProps {
	skillId: string;
}

export function SkillDetailView({ skillId }: SkillDetailViewProps) {
	const { data: skill, isLoading } = useSkillDetail(skillId);
	const { resolvedTheme } = useTheme();
	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	if (isLoading || !skill) {
		return (
			<div>
				<PageHeader
					title="Loading..."
					breadcrumbs={[
						{ label: "Skills", href: "/skills" },
						{ label: "..." },
					]}
				/>
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={skill.name}
				description={skill.description}
				breadcrumbs={[
					{ label: "Skills", href: "/skills" },
					{ label: skill.name },
				]}
				actions={
					<div className="flex items-center gap-3">
						<StatusBadge
							status={STATUS_MAP[skill.status] ?? "neutral"}
							label={STATUS_LABEL_MAP[skill.status] ?? skill.status}
						/>
						<Button variant="outline" size="sm" asChild>
							<Link href="/skills">
								<ArrowLeft className="mr-1.5 size-4" />
								Back
							</Link>
						</Button>
					</div>
				}
			/>

			{/* Two-column layout: config editor (8/12) + agent toggles (4/12) */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				<div className="lg:col-span-8">
					<SkillConfigEditor
						skillId={skill.id}
						config={skill.config}
					/>
				</div>
				<div className="lg:col-span-4">
					<SkillAgentToggles
						skillId={skill.id}
						agents={skill.agents}
					/>
				</div>
			</div>

			{/* Readme section */}
			{skill.readme && (
				<div className="mt-8">
					<h2 className="mb-4 text-sm font-semibold">Documentation</h2>
					<div
						className="rounded-lg border p-6"
						data-color-mode={colorMode}
					>
						<MDEditor
							value={skill.readme}
							preview="preview"
							hideToolbar
							height={400}
							{...(true ? { visibleDragbar: false } : {})}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
