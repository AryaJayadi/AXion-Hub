"use client";

import { ExternalLink, ToggleLeft, ToggleRight, Trash2, RefreshCw } from "lucide-react";

import type { PluginDetail } from "@/entities/plugin";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useTogglePlugin, useUninstallPlugin } from "../api/use-plugins";

interface PluginDetailPanelProps {
	plugin: PluginDetail;
}

export function PluginDetailPanel({ plugin }: PluginDetailPanelProps) {
	const togglePlugin = useTogglePlugin();
	const uninstallPlugin = useUninstallPlugin();

	return (
		<Card className="gap-4 py-5">
			<CardContent className="space-y-4">
				{/* Header row */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<h2 className="text-xl font-semibold text-foreground">
								{plugin.name}
							</h2>
							<StatusBadge status={plugin.status} size="sm" />
						</div>
						<p className="text-sm text-muted-foreground">
							v{plugin.version} by {plugin.author}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => togglePlugin.mutate(plugin.id)}
						>
							{plugin.status === "active" ? (
								<>
									<ToggleLeft className="size-4" />
									Disable
								</>
							) : (
								<>
									<ToggleRight className="size-4" />
									Enable
								</>
							)}
						</Button>
						<Button variant="outline" size="sm">
							<RefreshCw className="size-4" />
							Check for Updates
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:text-destructive"
							onClick={() => uninstallPlugin.mutate(plugin.id)}
						>
							<Trash2 className="size-4" />
							Uninstall
						</Button>
					</div>
				</div>

				{/* Description */}
				<p className="text-sm text-muted-foreground">
					{plugin.description}
				</p>

				{/* Homepage link */}
				{plugin.homepage && (
					<a
						href={plugin.homepage}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
					>
						<ExternalLink className="size-3.5" />
						{plugin.homepage}
					</a>
				)}

				{/* Permissions */}
				{plugin.permissions.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Permissions
						</p>
						<div className="flex flex-wrap gap-1.5">
							{plugin.permissions.map((perm) => (
								<Badge key={perm} variant="outline">
									{perm}
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
