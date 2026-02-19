"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2, LogOut, Monitor, Smartphone } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	useActiveSessions,
	useRevokeOtherSessions,
	useRevokeSession,
} from "../api/use-security";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a user agent string into a simple browser/device label.
 */
function parseUserAgent(ua: string | null | undefined): {
	label: string;
	isMobile: boolean;
} {
	if (!ua) return { label: "Unknown device", isMobile: false };

	const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);

	// Browser detection
	if (ua.includes("Firefox")) return { label: "Firefox", isMobile };
	if (ua.includes("Edg/")) return { label: "Microsoft Edge", isMobile };
	if (ua.includes("Chrome") && !ua.includes("Edg/"))
		return { label: "Chrome", isMobile };
	if (ua.includes("Safari") && !ua.includes("Chrome"))
		return { label: "Safari", isMobile };

	return { label: "Unknown browser", isMobile };
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SessionsSkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActiveSessionsCard() {
	const { data: sessions, isLoading } = useActiveSessions();
	const revokeSession = useRevokeSession();
	const revokeOtherSessions = useRevokeOtherSessions();

	const hasOtherSessions = sessions && sessions.length > 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Active Sessions</CardTitle>
				<CardDescription>
					Manage your active sessions across devices
				</CardDescription>
				{hasOtherSessions && (
					<CardAction>
						<Button
							variant="outline"
							size="sm"
							onClick={() => revokeOtherSessions.mutate()}
							disabled={revokeOtherSessions.isPending}
						>
							{revokeOtherSessions.isPending && (
								<Loader2 className="mr-2 size-3 animate-spin" />
							)}
							<LogOut className="size-3" />
							Revoke All Other Sessions
						</Button>
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<SessionsSkeleton />
				) : !sessions || sessions.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No active sessions found.
					</p>
				) : (
					<div className="space-y-3">
						{sessions.map((session) => {
							const { label, isMobile } = parseUserAgent(
								session.userAgent,
							);
							const isCurrent = !!(session as { current?: boolean }).current;
							const DeviceIcon = isMobile
								? Smartphone
								: Monitor;

							return (
								<div
									key={session.token}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<DeviceIcon className="size-5 text-muted-foreground" />
										<div className="space-y-0.5">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">
													{label}
												</span>
												{isCurrent && (
													<StatusBadge
														status="active"
														label="Current"
														size="sm"
														showDot={false}
													/>
												)}
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												{session.ipAddress && (
													<span>
														{session.ipAddress}
													</span>
												)}
												<span>
													{formatDistanceToNow(
														new Date(
															session.createdAt,
														),
														{ addSuffix: true },
													)}
												</span>
											</div>
										</div>
									</div>

									{!isCurrent && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												revokeSession.mutate(
													session.token,
												)
											}
											disabled={
												revokeSession.isPending
											}
										>
											Revoke
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
