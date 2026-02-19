"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

// ---------------------------------------------------------------------------
// Theme options
// ---------------------------------------------------------------------------

const THEME_OPTIONS = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ThemeSettingsForm() {
	const { theme, setTheme } = useTheme();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Appearance</CardTitle>
				<CardDescription>Choose your preferred theme</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-3">
					{THEME_OPTIONS.map((option) => {
						const isActive = theme === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => setTheme(option.value)}
								className={cn(
									"flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
									isActive
										? "border-primary bg-accent text-accent-foreground font-medium"
										: "border-border text-muted-foreground hover:border-primary/50 hover:bg-accent/50",
								)}
							>
								<option.icon className="size-5" />
								{option.label}
							</button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
