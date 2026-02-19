"use client";

import { useState } from "react";
import { Github, Trello, Briefcase, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	useIntegrations,
	useConnectIntegration,
	useDisconnectIntegration,
	type Integration,
} from "../api/use-integrations";

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
	Github,
	Trello,
	Briefcase,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntegrationCards() {
	const { data: integrations, isLoading } = useIntegrations();
	const connectMutation = useConnectIntegration();
	const disconnectMutation = useDisconnectIntegration();

	if (isLoading || !integrations) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<SkeletonIntegrationCard />
				<SkeletonIntegrationCard />
				<SkeletonIntegrationCard />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{integrations.map((integration) => (
				<IntegrationCard
					key={integration.id}
					integration={integration}
					onConnect={() => connectMutation.mutate(integration.id)}
					onDisconnect={() => disconnectMutation.mutate(integration.id)}
					isConnecting={
						connectMutation.isPending &&
						connectMutation.variables === integration.id
					}
					isDisconnecting={
						disconnectMutation.isPending &&
						disconnectMutation.variables === integration.id
					}
				/>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Single integration card
// ---------------------------------------------------------------------------

interface IntegrationCardProps {
	integration: Integration;
	onConnect: () => void;
	onDisconnect: () => void;
	isConnecting: boolean;
	isDisconnecting: boolean;
}

function IntegrationCard({
	integration,
	onConnect,
	onDisconnect,
	isConnecting,
	isDisconnecting,
}: IntegrationCardProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const Icon = ICON_MAP[integration.icon] ?? Briefcase;

	return (
		<Card>
			<CardHeader className="flex flex-row items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
					<Icon className="size-5" />
				</div>
				<div className="flex-1 space-y-1">
					<CardTitle className="text-base">{integration.name}</CardTitle>
					<CardDescription className="text-xs">
						{integration.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					{integration.connected ? (
						<Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
							Connected
						</Badge>
					) : (
						<Badge variant="secondary">Not Connected</Badge>
					)}
					{integration.lastSynced && (
						<span className="text-xs text-muted-foreground">
							Synced{" "}
							{formatDistanceToNow(integration.lastSynced, {
								addSuffix: true,
							})}
						</span>
					)}
				</div>

				{integration.connected ? (
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm" className="w-full">
								Disconnect
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Disconnect {integration.name}?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove the connection to {integration.name}.
									You can reconnect at any time.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										onDisconnect();
										setConfirmOpen(false);
									}}
								>
									{isDisconnecting && (
										<Loader2 className="mr-2 size-4 animate-spin" />
									)}
									Disconnect
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : (
					<Button
						size="sm"
						className="w-full"
						onClick={onConnect}
						disabled={isConnecting}
					>
						{isConnecting && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Connect
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SkeletonIntegrationCard() {
	return (
		<div className="rounded-xl border bg-card p-6 space-y-4">
			<div className="flex items-start gap-3">
				<Skeleton className="size-10 rounded-lg" />
				<div className="space-y-2 flex-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-full" />
				</div>
			</div>
			<Skeleton className="h-5 w-20" />
			<Skeleton className="h-8 w-full" />
		</div>
	);
}
