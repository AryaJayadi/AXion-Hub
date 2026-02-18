"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Separator } from "@/shared/ui/separator";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { NotificationBell } from "@/features/dashboard/components/notification-bell";
import { UserMenu } from "./user-menu";

interface HeaderBarProps {
	user: { name: string; email: string; image?: string | null };
}

function useBreadcrumbs() {
	const pathname = usePathname();

	if (pathname === "/") {
		return [{ label: "Dashboard", href: "/", isCurrentPage: true }];
	}

	const segments = pathname.split("/").filter(Boolean);

	const crumbs = [{ label: "Home", href: "/", isCurrentPage: false }];

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (!segment) continue;
		const href = `/${segments.slice(0, i + 1).join("/")}`;
		const label = segment
			.replace(/-/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase());
		const isCurrentPage = i === segments.length - 1;
		crumbs.push({ label, href, isCurrentPage });
	}

	return crumbs;
}

export function HeaderBar({ user }: HeaderBarProps) {
	const breadcrumbs = useBreadcrumbs();

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<Separator orientation="vertical" className="mr-2 h-4" />

			<Breadcrumb className="flex-1">
				<BreadcrumbList>
					{breadcrumbs.map((crumb, index) => (
						<Fragment key={crumb.href}>
							{index > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{crumb.isCurrentPage ? (
									<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={crumb.href}>{crumb.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			<button
				type="button"
				className="hidden items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
				aria-label="Search"
			>
				<Search className="size-4" />
				<span>Search...</span>
				<kbd className="pointer-events-none ml-4 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
					<span className="text-xs">&#8984;</span>K
				</kbd>
			</button>

			<NotificationBell />
			<UserMenu user={user} />
		</header>
	);
}
