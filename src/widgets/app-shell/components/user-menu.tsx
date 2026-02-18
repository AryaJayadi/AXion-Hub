"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface UserMenuProps {
	user: { name: string; email: string; image?: string | null };
}

export function UserMenu({ user }: UserMenuProps) {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	async function handleSignOut() {
		setIsSigningOut(true);
		try {
			await authClient.signOut();
			router.push("/login");
		} catch {
			setIsSigningOut(false);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative size-8 rounded-full">
					<Avatar>
						{user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.push("/settings/profile")}>
					<User />
					<span>Profile</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => router.push("/settings")}>
					<Settings />
					<span>Settings</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					disabled={isSigningOut}
				>
					<LogOut />
					<span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
