"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";

import { PageHeader } from "@/shared/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { PluginDetailPanel } from "@/features/plugins/components/plugin-detail-panel";
import { PluginSettingsForm } from "@/features/plugins/components/plugin-settings-form";
import { PluginAgentToggles } from "@/features/plugins/components/plugin-agent-toggles";
import { usePluginDetail } from "@/features/plugins/api/use-plugin-detail";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PluginDetailViewProps {
	pluginId: string;
}

export function PluginDetailView({ pluginId }: PluginDetailViewProps) {
	const { data: plugin, isLoading } = usePluginDetail(pluginId);
	const { resolvedTheme } = useTheme();

	if (isLoading || !plugin) {
		return (
			<div>
				<PageHeader
					title="Plugin"
					breadcrumbs={[
						{ label: "Plugins", href: "/plugins" },
						{ label: "Loading..." },
					]}
				/>
				<SkeletonDetail />
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={plugin.name}
				breadcrumbs={[
					{ label: "Plugins", href: "/plugins" },
					{ label: plugin.name },
				]}
			/>

			<div className="space-y-6">
				{/* Summary card */}
				<PluginDetailPanel plugin={plugin} />

				{/* Tabbed content */}
				<Tabs defaultValue="settings">
					<TabsList>
						<TabsTrigger value="settings">Settings</TabsTrigger>
						<TabsTrigger value="agents">Agents</TabsTrigger>
						<TabsTrigger value="documentation">Documentation</TabsTrigger>
						<TabsTrigger value="updates">Update History</TabsTrigger>
					</TabsList>

					<TabsContent value="settings" className="pt-6">
						<PluginSettingsForm
							pluginId={plugin.id}
							config={plugin.config}
							configSchema={plugin.configSchema}
						/>
					</TabsContent>

					<TabsContent value="agents" className="pt-6">
						<PluginAgentToggles
							pluginId={plugin.id}
							agents={plugin.agents}
						/>
					</TabsContent>

					<TabsContent value="documentation" className="pt-6">
						<div
							data-color-mode={
								resolvedTheme === "dark" ? "dark" : "light"
							}
						>
							<MDEditor
								value={plugin.readme}
								preview="preview"
								visibleDragbar={false}
								height={400}
								hideToolbar
								{...(undefined === undefined ? {} : {})}
							/>
						</div>
					</TabsContent>

					<TabsContent value="updates" className="pt-6">
						<div className="space-y-4">
							{plugin.updateHistory.map((entry) => (
								<div
									key={entry.version}
									className="flex gap-4 border-b border-border pb-4 last:border-0"
								>
									<div className="shrink-0">
										<span className="inline-flex items-center rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
											v{entry.version}
										</span>
									</div>
									<div className="flex-1 space-y-1">
										<p className="text-sm text-foreground">
											{entry.changelog}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDistanceToNow(entry.date, {
												addSuffix: true,
											})}
										</p>
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
