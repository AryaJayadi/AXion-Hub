import {
	LayoutDashboard,
	Bot,
	MessageSquare,
	Kanban,
	Clock,
	BookOpen,
	Radio,
	Globe,
	Brain,
	Activity,
	FolderOpen,
	MonitorCheck,
	Workflow,
	Plug,
	Package,
	Shield,
	FileOutput,
	ScrollText,
	Scale,
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
			{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
			{ title: "Agents", url: "/agents", icon: Bot },
			{ title: "Chat", url: "/chat", icon: MessageSquare },
			{ title: "Missions", url: "/missions", icon: Kanban },
			{ title: "Sessions", url: "/sessions", icon: Clock },
			{ title: "Memory", url: "/memory", icon: BookOpen },
		],
	},
	{
		label: "Operations",
		items: [
			{ title: "Gateway", url: "/gateway", icon: Radio },
			{ title: "Channels", url: "/channels", icon: Globe },
			{ title: "Models", url: "/models", icon: Brain },
			{ title: "Activity", url: "/activity", icon: Activity },
			{ title: "Files", url: "/workspace", icon: FolderOpen },
			{ title: "Monitor", url: "/monitor", icon: MonitorCheck },
		],
	},
	{
		label: "Automation",
		items: [
			{ title: "Workflows", url: "/workflows", icon: Workflow },
			{ title: "Skills", url: "/skills", icon: Plug },
			{ title: "Plugins", url: "/plugins", icon: Package },
		],
	},
	{
		label: "System",
		items: [
			{ title: "Approvals", url: "/approvals", icon: Shield },
			{ title: "Deliverables", url: "/deliverables", icon: FileOutput },
			{ title: "Audit", url: "/audit", icon: ScrollText },
			{ title: "Governance", url: "/governance/policies", icon: Scale },
			{ title: "Settings", url: "/settings", icon: Settings },
		],
	},
];
