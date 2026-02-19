import type { LucideIcon } from "lucide-react";

/**
 * General workspace settings.
 */
export interface GeneralSettings {
	appName: string;
	timezone: string;
	language: string;
}

/**
 * Profile settings (synced with better-auth user record).
 */
export interface ProfileSettings {
	displayName: string;
	avatar: string | null;
}

/**
 * Navigation item for the settings sidebar.
 */
export interface SettingsNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}
