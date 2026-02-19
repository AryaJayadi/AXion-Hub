"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import {
	GitBranch,
	CreditCard,
	BarChart3,
	MessageSquare,
	BookOpen,
	Brain,
	Database,
	Bell,
	Phone,
	HardDrive,
	Layers,
	FileText,
	Zap,
	Cpu,
	Package,
	type LucideIcon,
} from "lucide-react";

import type { AvailablePlugin } from "@/entities/plugin";
import { SearchInput } from "@/shared/ui/search-input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Card, CardContent } from "@/shared/ui/card";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import { useAvailablePlugins, useInstallPlugin } from "../api/use-plugin-install";
import { usePluginInstallStore } from "../model/plugin-install-store";

/** Map icon name strings to lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
	GitBranch,
	CreditCard,
	BarChart3,
	MessageSquare,
	BookOpen,
	Brain,
	Database,
	Bell,
	Phone,
	HardDrive,
	Layers,
	FileText,
	Zap,
	Cpu,
	Github: GitBranch, // Fallback -- GitHub icon would need react-icons
};

const CATEGORIES = [
	"All",
	"Analytics",
	"Messaging",
	"Storage",
	"AI",
	"DevOps",
] as const;

/** Status label for the install progress */
const INSTALL_STATUS_LABELS: Record<string, string> = {
	downloading: "Downloading...",
	installing: "Installing...",
	configuring: "Configuring...",
	complete: "Complete",
	error: "Failed",
};

function formatDownloads(count: number): string {
	if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
	return count.toString();
}

function PluginCard({ plugin }: { plugin: AvailablePlugin }) {
	const installPlugin = useInstallPlugin();
	const installProgress = usePluginInstallStore((s) =>
		s.installs.get(plugin.id),
	);

	const IconComponent = ICON_MAP[plugin.icon] ?? Package;
	const isInstalling =
		installProgress && installProgress.status !== "complete" && installProgress.status !== "error";

	return (
		<Card className="gap-4 py-4">
			<CardContent className="space-y-3">
				{/* Header: icon + name + author */}
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
						<IconComponent className="size-5 text-muted-foreground" />
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="font-medium text-foreground leading-tight">
							{plugin.name}
						</h3>
						<p className="text-xs text-muted-foreground">
							{plugin.author}
						</p>
					</div>
				</div>

				{/* Description */}
				<p className="text-sm text-muted-foreground line-clamp-2">
					{plugin.description}
				</p>

				{/* Footer: downloads + action */}
				<div className="flex items-center justify-between pt-1">
					<span className="text-xs text-muted-foreground">
						{formatDownloads(plugin.downloads)} downloads
					</span>
					{plugin.installed ? (
						<Badge variant="secondary">Installed</Badge>
					) : isInstalling ? (
						<div className="w-28 space-y-1">
							<Progress value={installProgress.progress} className="h-1.5" />
							<p className="text-xs text-muted-foreground text-right">
								{INSTALL_STATUS_LABELS[installProgress.status]}
							</p>
						</div>
					) : installProgress?.status === "complete" ? (
						<Badge variant="secondary">Installed</Badge>
					) : (
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								installPlugin.mutate({ id: plugin.id, name: plugin.name })
							}
							disabled={installPlugin.isPending}
						>
							Install
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function PluginBrowser() {
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [category, setCategory] = useState<string>("All");
	const { data: plugins, isLoading } = useAvailablePlugins(search || undefined);

	const filtered = useMemo(() => {
		if (!plugins) return [];
		if (category === "All") return plugins;
		return plugins.filter((p) => p.category === category);
	}, [plugins, category]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<SearchInput
					value=""
					onChange={() => {}}
					placeholder="Search available plugins..."
					className="max-w-md"
				/>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<SearchInput
				value={search}
				onChange={setSearch}
				placeholder="Search available plugins..."
				className="max-w-md"
			/>

			{/* Category filters */}
			<div className="flex flex-wrap gap-2">
				{CATEGORIES.map((cat) => (
					<Button
						key={cat}
						variant={category === cat ? "default" : "outline"}
						size="sm"
						onClick={() => setCategory(cat)}
					>
						{cat}
					</Button>
				))}
			</div>

			{/* Plugin grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filtered.map((plugin) => (
					<PluginCard key={plugin.id} plugin={plugin} />
				))}
			</div>

			{filtered.length === 0 && (
				<div className="py-12 text-center text-sm text-muted-foreground">
					No plugins found matching your criteria.
				</div>
			)}
		</div>
	);
}
