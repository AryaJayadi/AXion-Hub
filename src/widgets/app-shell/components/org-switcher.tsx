"use client";

import {
	ChevronsUpDown,
	Check,
	Plus,
} from "lucide-react";
import {
	authClient,
	useActiveOrganization,
	useListOrganizations,
} from "@/features/auth/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/shared/ui/sidebar";

const ORG_COLORS = [
	"bg-blue-500",
	"bg-emerald-500",
	"bg-violet-500",
	"bg-amber-500",
	"bg-rose-500",
	"bg-cyan-500",
	"bg-indigo-500",
	"bg-orange-500",
];

function getOrgColor(identifier: string): string {
	let hash = 0;
	for (let i = 0; i < identifier.length; i++) {
		hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % ORG_COLORS.length;
	return ORG_COLORS[index] ?? ORG_COLORS[0]!;
}

function OrgAvatar({
	name,
	identifier,
	className,
}: {
	name: string;
	identifier: string;
	className?: string;
}) {
	const colorClass = getOrgColor(identifier);
	const initial = name.charAt(0).toUpperCase();

	return (
		<div
			className={`flex items-center justify-center rounded-md text-white font-semibold text-xs ${colorClass} ${className ?? ""}`}
		>
			{initial}
		</div>
	);
}

export function OrgSwitcher() {
	const { data: activeOrg, isPending: isActiveLoading } =
		useActiveOrganization();
	const { data: orgList, isPending: isListLoading } =
		useListOrganizations();

	const isLoading = isActiveLoading || isListLoading;

	if (isLoading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuSkeleton showIcon />
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	const organizations = orgList ?? [];
	const currentOrg = activeOrg;

	async function handleSwitchOrg(organizationId: string) {
		await authClient.organization.setActive({
			organizationId,
		});
	}

	function handleCreateOrg() {
		// Placeholder for future org creation UI (out of scope for Phase 2)
		console.log("Create organization clicked - feature coming soon");
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							tooltip={currentOrg?.name ?? "Select organization"}
						>
							{currentOrg ? (
								<OrgAvatar
									name={currentOrg.name}
									identifier={currentOrg.id}
									className="size-8 shrink-0"
								/>
							) : (
								<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-semibold">
									?
								</div>
							)}
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{currentOrg?.name ?? "No organization"}
								</span>
								{currentOrg?.slug && (
									<span className="truncate text-xs text-muted-foreground">
										{currentOrg.slug}
									</span>
								)}
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
						align="start"
						side="bottom"
						sideOffset={4}
					>
						<DropdownMenuLabel>Organizations</DropdownMenuLabel>
						{organizations.length === 0 ? (
							<DropdownMenuItem disabled>
								No organizations
							</DropdownMenuItem>
						) : (
							organizations.map((org) => {
								const isActive = currentOrg?.id === org.id;
								return (
									<DropdownMenuItem
										key={org.id}
										onClick={() => handleSwitchOrg(org.id)}
									>
										<OrgAvatar
											name={org.name}
											identifier={org.id}
											className="size-5 shrink-0"
										/>
										<span className="truncate">{org.name}</span>
										{isActive && (
											<Check className="ml-auto size-4 text-muted-foreground" />
										)}
									</DropdownMenuItem>
								);
							})
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleCreateOrg}>
							<Plus className="size-4" />
							<span>Create organization</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
