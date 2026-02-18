import {
	LayoutDashboard,
	Bot,
	MessageSquare,
	Kanban,
	Radio,
	Globe,
	Activity,
	FolderOpen,
	Workflow,
	Plug,
	Shield,
	Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
	{
		label: "Core",
		items: [
			{ title: "Dashboard", url: "/", icon: LayoutDashboard },
			{ title: "Agents", url: "/agents", icon: Bot },
			{ title: "Chat", url: "/chat", icon: MessageSquare },
			{ title: "Missions", url: "/missions", icon: Kanban },
		],
	},
	{
		label: "Operations",
		items: [
			{ title: "Gateway", url: "/gateway", icon: Radio },
			{ title: "Channels", url: "/channels", icon: Globe },
			{ title: "Activity", url: "/activity", icon: Activity },
			{ title: "Files", url: "/workspace", icon: FolderOpen },
		],
	},
	{
		label: "Automation",
		items: [
			{ title: "Workflows", url: "/workflows", icon: Workflow },
			{ title: "Skills", url: "/skills", icon: Plug },
		],
	},
	{
		label: "System",
		items: [
			{ title: "Approvals", url: "/approvals", icon: Shield },
			{ title: "Settings", url: "/settings", icon: Settings },
		],
	},
];
