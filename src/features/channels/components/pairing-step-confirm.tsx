"use client";

import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { usePairingStore } from "../model/pairing-store";
import { useCompletePairing } from "../api/use-channel-pairing";
import { MOCK_AGENT_OPTIONS } from "../api/use-channels";

/** Format platform name for display */
function platformLabel(platform: string | null): string {
	if (!platform) return "Unknown";
	return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function PairingStepConfirm() {
	const platform = usePairingStore((s) => s.platform);
	const pairingState = usePairingStore((s) => s.pairingState);
	const authData = usePairingStore((s) => s.authData);
	const channelConfig = usePairingStore((s) => s.channelConfig);
	const resetWizard = usePairingStore((s) => s.resetWizard);

	const completePairing = useCompletePairing();

	function handleComplete() {
		completePairing.mutate();
	}

	const agentName = channelConfig?.agentId
		? MOCK_AGENT_OPTIONS.find((a) => a.id === channelConfig.agentId)?.name ??
			"Unknown"
		: "None";

	const authStatus =
		pairingState === "connected"
			? "Connected"
			: authData?.botToken
				? "Token provided"
				: authData?.oauthCode
					? "OAuth connected"
					: platform === "web"
						? "No auth required"
						: "Pending";

	if (completePairing.isSuccess) {
		return (
			<div className="mx-auto flex max-w-md flex-col items-center gap-6 py-12 text-center">
				<div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
					<CheckCircle className="size-8 text-green-600" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-foreground">
						Channel connected successfully!
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Your {platformLabel(platform)} channel is now paired and ready to
						receive messages.
					</p>
				</div>
				<Button asChild>
					<Link href="/channels" onClick={() => resetWizard()}>
						Go to Channels
						<ArrowRight className="ml-2 size-4" />
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Pairing Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Platform</span>
						<Badge variant="outline">{platformLabel(platform)}</Badge>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Channel Name</span>
						<span className="text-sm font-medium">
							{channelConfig?.name ?? "Unnamed"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							Assigned Agent
						</span>
						<span className="text-sm font-medium">{agentName}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							Authentication
						</span>
						<StatusBadge
							status={
								authStatus === "Connected" || authStatus === "Token provided"
									? "connected"
									: authStatus === "OAuth connected"
										? "connected"
										: authStatus === "No auth required"
											? "active"
											: "pending"
							}
							label={authStatus}
							size="sm"
						/>
					</div>
				</CardContent>
			</Card>

			<Button
				onClick={handleComplete}
				disabled={completePairing.isPending}
				className="w-full"
			>
				{completePairing.isPending ? (
					<>
						<Loader2 className="mr-2 size-4 animate-spin" />
						Completing Pairing...
					</>
				) : (
					"Complete Pairing"
				)}
			</Button>

			{completePairing.isError && (
				<p className="text-center text-sm text-destructive">
					Failed to complete pairing. Please try again.
				</p>
			)}
		</div>
	);
}
