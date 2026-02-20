"use client";

import Link from "next/link";
import { Clock, Bot, Cpu, Hash, Timer, Expand } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CrossAgentSession } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";

interface SessionSlideOverProps {
	session: CrossAgentSession | null;
	open: boolean;
	onClose: () => void;
}

function formatTokenCount(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toLocaleString("en-US");
}

function formatDuration(session: CrossAgentSession): string {
	if (!session.endedAt) return "Active";
	const ms = session.endedAt.getTime() - session.startedAt.getTime();
	const minutes = Math.round(ms / 60000);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m`;
}

function DetailRow({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Icon className="size-4" />
				{label}
			</div>
			<div className="text-sm font-medium">{value}</div>
		</div>
	);
}

export function SessionSlideOver({ session, open, onClose }: SessionSlideOverProps) {
	return (
		<Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<SheetContent side="right" className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle>
						{session ? `${session.agentName} Session` : "Session Detail"}
					</SheetTitle>
					<SheetDescription>
						{session ? session.id : "No session selected"}
					</SheetDescription>
				</SheetHeader>

				{session ? (
					<div className="flex-1 overflow-y-auto px-4 py-2">
						<div className="space-y-0">
							<DetailRow
								icon={Bot}
								label="Agent"
								value={session.agentName}
							/>
							<DetailRow
								icon={Bot}
								label="Status"
								value={<StatusBadge status={session.status} size="sm" />}
							/>
							<DetailRow
								icon={Cpu}
								label="Model"
								value={
									<span className="font-mono text-xs">
										{session.model}
									</span>
								}
							/>
							<DetailRow
								icon={Hash}
								label="Tokens"
								value={formatTokenCount(session.tokenCount)}
							/>
							<DetailRow
								icon={Timer}
								label="Duration"
								value={formatDuration(session)}
							/>
							<DetailRow
								icon={Clock}
								label="Started"
								value={formatDistanceToNow(session.startedAt, {
									addSuffix: true,
								})}
							/>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center py-12 text-muted-foreground">
						No session selected
					</div>
				)}

				<SheetFooter>
					{session && (
						<Button variant="outline" size="sm" className="w-full" asChild>
							<Link href={`/sessions/${session.id}`}>
								<Expand className="mr-1.5 size-4" />
								View full transcript
							</Link>
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
