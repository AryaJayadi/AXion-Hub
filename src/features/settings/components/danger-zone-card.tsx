"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
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

import { authClient } from "@/features/auth/lib/auth-client";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DangerZoneCardProps {
	orgName: string;
	organizationId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DangerZoneCard({ orgName, organizationId }: DangerZoneCardProps) {
	return (
		<Card className="border-destructive">
			<CardHeader>
				<div className="flex items-center gap-2">
					<AlertTriangle className="size-5 text-destructive" />
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
				</div>
				<CardDescription>
					Irreversible and destructive actions. Proceed with extreme caution.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-0">
				{/* Reset All Data */}
				<ResetDataSection orgName={orgName} />

				<Separator className="my-6" />

				{/* Disconnect Gateway */}
				<DisconnectGatewaySection />

				<Separator className="my-6" />

				{/* Delete Workspace */}
				<DeleteWorkspaceSection
					orgName={orgName}
					organizationId={organizationId}
				/>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Reset Data Section
// ---------------------------------------------------------------------------

function ResetDataSection({ orgName }: { orgName: string }) {
	const [confirmText, setConfirmText] = useState("");
	const [isResetting, setIsResetting] = useState(false);

	const canConfirm = confirmText === orgName;

	async function handleReset() {
		setIsResetting(true);
		try {
			// Mock reset operation
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Workspace data has been reset");
			setConfirmText("");
		} catch {
			toast.error("Failed to reset workspace data");
		} finally {
			setIsResetting(false);
		}
	}

	return (
		<div className="space-y-3">
			<div>
				<h4 className="text-sm font-medium">Reset All Data</h4>
				<p className="text-xs text-muted-foreground mt-1">
					Resets all workspace data including agents, sessions, and tasks.
					User accounts will be preserved.
				</p>
			</div>
			<div className="space-y-2">
				<Label className="text-xs">
					Type <span className="font-mono font-semibold">{orgName}</span> to
					confirm
				</Label>
				<Input
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder={orgName}
					className="max-w-sm"
				/>
			</div>
			<Button
				variant="destructive"
				size="sm"
				disabled={!canConfirm || isResetting}
				onClick={handleReset}
			>
				{isResetting && <Loader2 className="mr-2 size-4 animate-spin" />}
				Reset Data
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Disconnect Gateway Section
// ---------------------------------------------------------------------------

function DisconnectGatewaySection() {
	const [isDisconnecting, setIsDisconnecting] = useState(false);

	async function handleDisconnect() {
		setIsDisconnecting(true);
		try {
			// Mock disconnect operation
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Gateway disconnected");
		} catch {
			toast.error("Failed to disconnect gateway");
		} finally {
			setIsDisconnecting(false);
		}
	}

	return (
		<div className="space-y-3">
			<div>
				<h4 className="text-sm font-medium">Disconnect Gateway</h4>
				<p className="text-xs text-muted-foreground mt-1">
					Disconnects from the OpenClaw Gateway. All agents will be
					disconnected and no new sessions can be created until reconnected.
				</p>
			</div>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive" size="sm">
						Disconnect Gateway
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disconnect Gateway?</AlertDialogTitle>
						<AlertDialogDescription>
							This will disconnect from the OpenClaw Gateway. All active
							agent sessions will be terminated. You can reconnect later from
							the gateway settings.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisconnect}
							disabled={isDisconnecting}
						>
							{isDisconnecting && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Disconnect
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Delete Workspace Section
// ---------------------------------------------------------------------------

function DeleteWorkspaceSection({
	orgName,
	organizationId,
}: {
	orgName: string;
	organizationId: string;
}) {
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const canConfirm = confirmText === orgName;

	async function handleDelete() {
		setIsDeleting(true);
		try {
			await authClient.organization.delete({
				organizationId,
			});
			toast.success("Workspace deleted");
		} catch {
			toast.error("Failed to delete workspace");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div className="space-y-3">
			<div>
				<h4 className="text-sm font-medium">Delete Workspace</h4>
				<p className="text-xs text-muted-foreground mt-1">
					Permanently deletes the entire workspace and all associated data
					including agents, sessions, tasks, and member accounts. This action
					cannot be undone.
				</p>
			</div>
			<div className="space-y-2">
				<Label className="text-xs">
					Type <span className="font-mono font-semibold">{orgName}</span> to
					confirm
				</Label>
				<Input
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder={orgName}
					className="max-w-sm"
				/>
			</div>
			<Button
				variant="destructive"
				size="sm"
				disabled={!canConfirm || isDeleting}
				onClick={handleDelete}
			>
				{isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
				Delete Workspace
			</Button>
		</div>
	);
}
