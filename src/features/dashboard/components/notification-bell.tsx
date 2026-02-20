"use client";

import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck } from "lucide-react";
import { useAlertStore } from "@/features/dashboard";
import { Button } from "@/shared/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/cn";
import type { AlertSeverity } from "@/features/dashboard";

// ---------------------------------------------------------------------------
// Severity icon mapping
// ---------------------------------------------------------------------------
const SEVERITY_ICONS: Record<AlertSeverity, typeof AlertTriangle> = {
	critical: AlertCircle,
	warning: AlertTriangle,
	info: Info,
};

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
	critical: "text-destructive",
	warning: "text-yellow-500",
	info: "text-blue-500",
};

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
function relativeTime(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

/**
 * Bell icon with unread badge counter and popover for recent alerts.
 * Rendered in the global HeaderBar across all pages.
 */
export function NotificationBell() {
	const router = useRouter();
	const unreadCount = useAlertStore((s) => s.unreadAlertCount);
	const recentAlerts = useAlertStore((s) => s.recentAlerts);
	const markRead = useAlertStore((s) => s.markRead);

	const displayAlerts = recentAlerts.slice(0, 10);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative size-8"
					aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
				>
					<Bell className="size-4" />
					{unreadCount > 0 && (
						<span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<p className="text-sm font-medium">Notifications</p>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto px-2 py-1 text-xs"
							onClick={() => useAlertStore.getState().markAllRead()}
						>
							<CheckCheck className="mr-1 size-3" />
							Mark all read
						</Button>
					)}
				</div>

				{displayAlerts.length === 0 ? (
					<div className="px-4 py-8 text-center text-sm text-muted-foreground">
						No notifications yet
					</div>
				) : (
					<div className="max-h-80 overflow-y-auto">
						{displayAlerts.map((alert) => {
							const SeverityIcon = SEVERITY_ICONS[alert.severity];
							const color = SEVERITY_COLORS[alert.severity];

							return (
								<button
									key={alert.id}
									type="button"
									onClick={() => {
										markRead(alert.id);
										router.push("/monitor/alerts");
									}}
									className={cn(
										"flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted/50",
										!alert.read && "bg-muted/30",
									)}
								>
									<SeverityIcon
										className={cn("mt-0.5 size-4 shrink-0", color)}
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{alert.ruleName}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{alert.message}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{relativeTime(alert.timestamp)}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				)}
				<div className="border-t p-2">
					<Button
						variant="ghost"
						size="sm"
						className="w-full text-xs"
						onClick={() => router.push("/monitor/alerts")}
					>
						View all alerts
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
