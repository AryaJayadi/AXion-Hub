export type SkillCategory =
	| "code"
	| "communication"
	| "data"
	| "productivity"
	| "integration"
	| "security";

export type SkillStatus = "enabled" | "disabled" | "update_available";

export interface Skill {
	id: string;
	name: string;
	description: string;
	category: SkillCategory;
	/** Lucide icon name */
	icon: string;
	version: string;
	status: SkillStatus;
	/** Number of agents currently using this skill */
	agentCount: number;
	/** JSON schema for skill config, or null if no config */
	configSchema: Record<string, unknown> | null;
	installedAt: Date;
}

export interface ClawHubSkill {
	id: string;
	name: string;
	description: string;
	category: SkillCategory;
	/** Lucide icon name */
	icon: string;
	version: string;
	author: string;
	downloads: number;
	rating: number;
	featured: boolean;
	trending: boolean;
	installable: boolean;
	installed: boolean;
}

/** Configuration object for a skill */
export type SkillConfig = Record<string, unknown>;

export interface SkillDetailAgent {
	id: string;
	name: string;
	enabled: boolean;
}

export interface SkillDetail extends Skill {
	config: SkillConfig | null;
	/** Markdown readme content */
	readme: string;
	/** Agents with toggle state for this skill */
	agents: SkillDetailAgent[];
}
