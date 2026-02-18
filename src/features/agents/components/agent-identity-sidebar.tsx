"use client";

import { cn } from "@/shared/lib/cn";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	IDENTITY_FILE_DEFAULTS,
	IDENTITY_FILE_KEYS,
	type IdentityFileKey,
} from "../lib/identity-templates";

interface AgentIdentitySidebarProps {
	activeFile: IdentityFileKey;
	onFileSelect: (fileKey: IdentityFileKey) => void;
}

export function AgentIdentitySidebar({ activeFile, onFileSelect }: AgentIdentitySidebarProps) {
	return (
		<aside className="w-48 shrink-0 border-r border-border">
			<ScrollArea className="h-full">
				<div className="py-2">
					{IDENTITY_FILE_KEYS.map((key) => {
						const template = IDENTITY_FILE_DEFAULTS[key];
						if (!template) return null;
						const isActive = activeFile === key;

						return (
							<button
								key={key}
								type="button"
								onClick={() => onFileSelect(key)}
								className={cn(
									"w-full text-left px-3 py-2.5 text-sm transition-colors",
									isActive
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
								)}
							>
								<div className={cn("font-mono text-xs", isActive && "font-medium")}>
									{template.name}
								</div>
								<div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
							</button>
						);
					})}
				</div>
			</ScrollArea>
		</aside>
	);
}

export function AgentIdentitySidebarSkeleton() {
	return (
		<aside className="w-48 shrink-0 border-r border-border">
			<div className="py-2 space-y-1 px-3">
				<div className="py-2.5 space-y-1.5">
					<Skeleton className="h-3.5 w-20" />
					<Skeleton className="h-3 w-32" />
				</div>
				<div className="py-2.5 space-y-1.5">
					<Skeleton className="h-3.5 w-24" />
					<Skeleton className="h-3 w-28" />
				</div>
				<div className="py-2.5 space-y-1.5">
					<Skeleton className="h-3.5 w-16" />
					<Skeleton className="h-3 w-36" />
				</div>
				<div className="py-2.5 space-y-1.5">
					<Skeleton className="h-3.5 w-22" />
					<Skeleton className="h-3 w-40" />
				</div>
			</div>
		</aside>
	);
}
