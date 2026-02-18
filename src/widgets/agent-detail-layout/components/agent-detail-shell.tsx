"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
	LayoutDashboard,
	FileText,
	MessageSquare,
	Brain,
	Wrench,
	Settings2,
	Shield,
	Radio,
	ScrollText,
	BarChart3,
} from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/cn";

const subPages = [
	{ title: "Overview", href: "", icon: LayoutDashboard },
	{ title: "Identity", href: "/identity", icon: FileText },
	{ title: "Sessions", href: "/sessions", icon: MessageSquare },
	{ title: "Memory", href: "/memory", icon: Brain },
	{ title: "Skills", href: "/skills", icon: Wrench },
	{ title: "Tools", href: "/tools", icon: Settings2 },
	{ title: "Sandbox", href: "/sandbox", icon: Shield },
	{ title: "Channels", href: "/channels", icon: Radio },
	{ title: "Logs", href: "/logs", icon: ScrollText },
	{ title: "Metrics", href: "/metrics", icon: BarChart3 },
] as const;

interface AgentDetailShellProps {
	agentId: string;
	agentName?: string | undefined;
	children: React.ReactNode;
}

export function AgentDetailShell({
	agentId,
	agentName,
	children,
}: AgentDetailShellProps) {
	const pathname = usePathname();
	const basePath = `/agents/${agentId}`;

	return (
		<div className="flex h-full">
			{/* Left sidebar navigation */}
			<aside className="w-56 shrink-0 border-r border-border">
				<ScrollArea className="h-full">
					{/* Agent name header */}
					{agentName && (
						<div className="px-4 py-3 border-b border-border">
							<p className="text-sm font-semibold truncate">{agentName}</p>
						</div>
					)}

					<nav className="space-y-1 px-3 py-4">
						{subPages.map((page) => {
							const href = `${basePath}${page.href}`;
							const isActive =
								page.href === ""
									? pathname === basePath
									: pathname.startsWith(href);

							return (
								<Link
									key={page.title}
									href={href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
										isActive
											? "bg-accent text-accent-foreground font-medium"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
									)}
								>
									<page.icon className="size-4" />
									{page.title}
								</Link>
							);
						})}
					</nav>
				</ScrollArea>
			</aside>

			{/* Main content area */}
			<main className="flex-1 overflow-auto p-6">{children}</main>
		</div>
	);
}
