/** Plugin operational status */
export type PluginStatus = "active" | "disabled" | "error";

/** An installed workspace plugin */
export interface Plugin {
	id: string;
	name: string;
	version: string;
	description: string;
	status: PluginStatus;
	lastUpdated: Date;
	author: string;
	homepage: string | null;
	permissions: string[];
	agentCount: number;
}

/** A plugin available for installation from the registry */
export interface AvailablePlugin {
	id: string;
	name: string;
	version: string;
	description: string;
	author: string;
	downloads: number;
	category: string;
	installed: boolean;
	icon: string; // lucide icon name
}

/** Extended plugin details for the detail page */
export interface PluginDetail extends Plugin {
	readme: string; // markdown content
	config: Record<string, unknown> | null;
	configSchema: Record<string, unknown> | null;
	agents: PluginAgent[];
	updateHistory: PluginUpdateEntry[];
}

/** Agent toggle state for a plugin */
export interface PluginAgent {
	id: string;
	name: string;
	enabled: boolean;
}

/** A single version update entry */
export interface PluginUpdateEntry {
	version: string;
	date: Date;
	changelog: string;
}

/** Progress state for an in-progress plugin installation */
export type PluginInstallStatus =
	| "downloading"
	| "installing"
	| "configuring"
	| "complete"
	| "error";

export interface PluginInstallProgress {
	pluginId: string;
	name: string;
	status: PluginInstallStatus;
	progress: number; // 0-100
	error: string | null;
}
