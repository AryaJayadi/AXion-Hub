"use client";

import {
	AlertTriangle,
	Bell,
	Download,
	Key,
	Plug,
	Settings,
	Shield,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import type { SettingsNavItem } from "../model/settings-types";

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const settingsNavItems: SettingsNavItem[] = [
	{ label: "General", href: "/settings", icon: Settings },
	{ label: "Profile", href: "/settings/profile", icon: User },
	{ label: "Security", href: "/settings/security", icon: Shield },
	{ label: "Team", href: "/settings/team", icon: Users },
	{ label: "API Keys", href: "/settings/api", icon: Key },
	{ label: "Notifications", href: "/settings/notifications", icon: Bell },
	{ label: "Integrations", href: "/settings/integrations", icon: Plug },
	{ label: "Backup & Export", href: "/settings/backup", icon: Download },
	{ label: "Danger Zone", href: "/settings/danger", icon: AlertTriangle },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsSidebar() {
	const pathname = usePathname();

	return (
		<nav className="w-full md:w-56 shrink-0">
			<div className="space-y-1">
				{settingsNavItems.map((item) => {
					const isActive =
						item.href === "/settings"
							? pathname === "/settings"
							: pathname.startsWith(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground font-medium"
									: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
							)}
						>
							<item.icon className="size-4" />
							{item.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
