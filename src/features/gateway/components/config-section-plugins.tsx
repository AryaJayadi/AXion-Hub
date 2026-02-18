"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PluginsConfig } from "@/entities/gateway-config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";

interface ConfigSectionPluginsProps {
	values: PluginsConfig;
	onUpdate: (values: PluginsConfig) => void;
}

export function ConfigSectionPlugins({
	values,
	onUpdate,
}: ConfigSectionPluginsProps) {
	const [newPlugin, setNewPlugin] = useState("");

	const handleAddPlugin = () => {
		const trimmed = newPlugin.trim();
		if (!trimmed || values.enabled.includes(trimmed)) return;

		onUpdate({
			...values,
			enabled: [...values.enabled, trimmed],
		});
		setNewPlugin("");
	};

	const handleRemovePlugin = (plugin: string) => {
		const updated = values.enabled.filter((p) => p !== plugin);
		const configs = { ...values.configs };
		delete configs[plugin];
		onUpdate({
			enabled: updated,
			configs,
		});
	};

	return (
		<div className="space-y-6">
			<FormField
				label="Enabled Plugins"
				description="Active plugins for this gateway instance"
			>
				<div className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{values.enabled.length === 0 ? (
							<p className="text-sm text-muted-foreground italic">
								No plugins enabled
							</p>
						) : (
							values.enabled.map((plugin) => (
								<Badge
									key={plugin}
									variant="secondary"
									className="gap-1 pr-1"
								>
									{plugin}
									<button
										type="button"
										onClick={() => handleRemovePlugin(plugin)}
										className="ml-1 rounded-sm p-0.5 hover:bg-muted"
										aria-label={`Remove ${plugin}`}
									>
										<Trash2 className="size-3" />
									</button>
								</Badge>
							))
						)}
					</div>
					<div className="flex gap-2">
						<Input
							value={newPlugin}
							onChange={(e) => setNewPlugin(e.target.value)}
							placeholder="Plugin name"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAddPlugin();
								}
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleAddPlugin}
							disabled={!newPlugin.trim()}
						>
							<Plus className="mr-1 size-4" />
							Add
						</Button>
					</div>
				</div>
			</FormField>

			{Object.keys(values.configs).length > 0 && (
				<FormField
					label="Plugin Configurations"
					description="Read-only view of plugin settings"
				>
					<div className="space-y-3">
						{Object.entries(values.configs).map(([name, config]) => (
							<div
								key={name}
								className="rounded-md border bg-muted/30 p-3"
							>
								<p className="mb-1 text-sm font-medium">{name}</p>
								<pre className="text-xs text-muted-foreground overflow-x-auto">
									{JSON.stringify(config, null, 2)}
								</pre>
							</div>
						))}
					</div>
				</FormField>
			)}
		</div>
	);
}
