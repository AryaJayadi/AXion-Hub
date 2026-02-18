"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/shared/ui/sidebar";
import { navigationConfig } from "../config/navigation";
import { OrgSwitcher } from "./org-switcher";

interface AppSidebarProps {
	user: { name: string; email: string; image?: string | null };
}

export function AppSidebar({ user: _user }: AppSidebarProps) {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<OrgSwitcher />
			</SidebarHeader>

			<SidebarContent>
				{navigationConfig.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive =
										item.url === "/"
											? pathname === "/"
											: pathname.startsWith(item.url);

									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={item.title}
											>
												<Link href={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}
