"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { usePairingStore } from "../model/pairing-store";

interface WhatsAppQrModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WhatsAppQrModal({ open, onOpenChange }: WhatsAppQrModalProps) {
	const pairingState = usePairingStore((s) => s.pairingState);
	const qrExpiresAt = usePairingStore((s) => s.qrExpiresAt);
	const startPairing = usePairingStore((s) => s.startPairing);
	const simulateQrScan = usePairingStore((s) => s.simulateQrScan);

	const [secondsRemaining, setSecondsRemaining] = useState(60);

	// Countdown timer for QR expiration
	useEffect(() => {
		if (!qrExpiresAt || !open) return;

		function tick() {
			const now = Date.now();
			const expiresAt = qrExpiresAt?.getTime() ?? now;
			const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
			setSecondsRemaining(remaining);
		}

		tick();
		const interval = setInterval(tick, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [qrExpiresAt, open]);

	// Auto-close when connected
	useEffect(() => {
		if (pairingState === "connected" && open) {
			const timer = setTimeout(() => {
				onOpenChange(false);
			}, 1500);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [pairingState, open, onOpenChange]);

	const isExpired = secondsRemaining <= 0 && pairingState === "waiting";

	const handleRefresh = useCallback(() => {
		startPairing();
	}, [startPairing]);

	// For demo: clicking the QR placeholder simulates a scan
	const handleQrClick = useCallback(() => {
		if (pairingState === "waiting") {
			simulateQrScan();
		}
	}, [pairingState, simulateQrScan]);

	const pairingStatusLabel: Record<string, string> = {
		idle: "Idle",
		generating: "Generating...",
		waiting: "Waiting for scan...",
		scanned: "Scanned! Connecting...",
		connected: "Connected!",
		error: "Error",
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Scan QR Code</DialogTitle>
					<DialogDescription>
						Use your phone to scan this QR code and link your WhatsApp account.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-6 py-4">
					{/* QR Code Display */}
					{pairingState === "generating" ? (
						<div className="flex size-64 items-center justify-center rounded-lg border border-border bg-muted">
							<div className="flex flex-col items-center gap-2 text-muted-foreground">
								<RefreshCw className="size-8 animate-spin" />
								<span className="text-sm">Generating QR Code...</span>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={handleQrClick}
							disabled={pairingState !== "waiting"}
							className="relative flex size-64 cursor-pointer items-center justify-center rounded-lg border-2 border-border bg-white transition-all hover:border-primary disabled:cursor-default"
						>
							{/* Placeholder QR code SVG */}
							<svg
								viewBox="0 0 200 200"
								className="size-56"
								aria-label="QR Code placeholder"
							>
								{/* Corner squares */}
								<rect x="10" y="10" width="50" height="50" fill="#000" rx="4" />
								<rect x="17" y="17" width="36" height="36" fill="#fff" rx="2" />
								<rect x="24" y="24" width="22" height="22" fill="#000" rx="2" />

								<rect x="140" y="10" width="50" height="50" fill="#000" rx="4" />
								<rect x="147" y="17" width="36" height="36" fill="#fff" rx="2" />
								<rect x="154" y="24" width="22" height="22" fill="#000" rx="2" />

								<rect x="10" y="140" width="50" height="50" fill="#000" rx="4" />
								<rect x="17" y="147" width="36" height="36" fill="#fff" rx="2" />
								<rect x="24" y="154" width="22" height="22" fill="#000" rx="2" />

								{/* Data pattern (mock) */}
								<rect x="70" y="10" width="8" height="8" fill="#000" />
								<rect x="86" y="10" width="8" height="8" fill="#000" />
								<rect x="102" y="10" width="8" height="8" fill="#000" />
								<rect x="118" y="10" width="8" height="8" fill="#000" />
								<rect x="70" y="26" width="8" height="8" fill="#000" />
								<rect x="102" y="26" width="8" height="8" fill="#000" />
								<rect x="70" y="42" width="8" height="8" fill="#000" />
								<rect x="86" y="42" width="8" height="8" fill="#000" />
								<rect x="118" y="42" width="8" height="8" fill="#000" />

								<rect x="10" y="70" width="8" height="8" fill="#000" />
								<rect x="26" y="70" width="8" height="8" fill="#000" />
								<rect x="42" y="70" width="8" height="8" fill="#000" />
								<rect x="70" y="70" width="8" height="8" fill="#000" />
								<rect x="86" y="70" width="8" height="8" fill="#000" />
								<rect x="118" y="70" width="8" height="8" fill="#000" />
								<rect x="150" y="70" width="8" height="8" fill="#000" />
								<rect x="182" y="70" width="8" height="8" fill="#000" />

								<rect x="10" y="86" width="8" height="8" fill="#000" />
								<rect x="42" y="86" width="8" height="8" fill="#000" />
								<rect x="70" y="86" width="8" height="8" fill="#000" />
								<rect x="102" y="86" width="8" height="8" fill="#000" />
								<rect x="134" y="86" width="8" height="8" fill="#000" />
								<rect x="166" y="86" width="8" height="8" fill="#000" />

								<rect x="10" y="102" width="8" height="8" fill="#000" />
								<rect x="26" y="102" width="8" height="8" fill="#000" />
								<rect x="42" y="102" width="8" height="8" fill="#000" />
								<rect x="70" y="102" width="8" height="8" fill="#000" />
								<rect x="86" y="102" width="8" height="8" fill="#000" />
								<rect x="118" y="102" width="8" height="8" fill="#000" />
								<rect x="150" y="102" width="8" height="8" fill="#000" />
								<rect x="166" y="102" width="8" height="8" fill="#000" />
								<rect x="182" y="102" width="8" height="8" fill="#000" />

								<rect x="10" y="118" width="8" height="8" fill="#000" />
								<rect x="42" y="118" width="8" height="8" fill="#000" />
								<rect x="86" y="118" width="8" height="8" fill="#000" />
								<rect x="102" y="118" width="8" height="8" fill="#000" />
								<rect x="134" y="118" width="8" height="8" fill="#000" />

								<rect x="70" y="140" width="8" height="8" fill="#000" />
								<rect x="86" y="140" width="8" height="8" fill="#000" />
								<rect x="118" y="140" width="8" height="8" fill="#000" />
								<rect x="150" y="140" width="8" height="8" fill="#000" />
								<rect x="182" y="140" width="8" height="8" fill="#000" />

								<rect x="70" y="156" width="8" height="8" fill="#000" />
								<rect x="102" y="156" width="8" height="8" fill="#000" />
								<rect x="134" y="156" width="8" height="8" fill="#000" />
								<rect x="166" y="156" width="8" height="8" fill="#000" />

								<rect x="70" y="172" width="8" height="8" fill="#000" />
								<rect x="86" y="172" width="8" height="8" fill="#000" />
								<rect x="118" y="172" width="8" height="8" fill="#000" />
								<rect x="150" y="172" width="8" height="8" fill="#000" />
								<rect x="182" y="172" width="8" height="8" fill="#000" />

								<rect x="70" y="188" width="8" height="8" fill="#000" />
								<rect x="102" y="188" width="8" height="8" fill="#000" />
								<rect x="134" y="188" width="8" height="8" fill="#000" />
								<rect x="150" y="188" width="8" height="8" fill="#000" />
							</svg>

							{/* Expired overlay */}
							{isExpired && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90">
									<span className="text-sm font-medium text-muted-foreground">
										QR Code Expired
									</span>
								</div>
							)}

							{/* Connected overlay */}
							{pairingState === "connected" && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90">
									<span className="text-sm font-semibold text-green-600">
										Connected!
									</span>
								</div>
							)}
						</button>
					)}

					{/* Instructions */}
					<div className="space-y-2 text-center text-sm text-muted-foreground">
						<p className="font-medium text-foreground">
							Open WhatsApp on your phone
						</p>
						<ol className="space-y-1 text-xs">
							<li>1. Go to Settings &gt; Linked Devices</li>
							<li>2. Tap &quot;Link a Device&quot;</li>
							<li>3. Point your phone camera at the QR code</li>
						</ol>
						{pairingState === "waiting" && (
							<p className="text-xs italic">
								Click the QR code to simulate a scan (demo)
							</p>
						)}
					</div>

					{/* Timer and Status */}
					<div className="flex items-center gap-4">
						<StatusBadge status={pairingState} />
						{pairingState === "waiting" && !isExpired && (
							<span className="text-sm tabular-nums text-muted-foreground">
								Expires in {secondsRemaining}s
							</span>
						)}
					</div>

					{/* Refresh Button */}
					{isExpired && (
						<Button
							variant="outline"
							onClick={handleRefresh}
							className="gap-2"
						>
							<RefreshCw className="size-4" />
							Refresh QR Code
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
