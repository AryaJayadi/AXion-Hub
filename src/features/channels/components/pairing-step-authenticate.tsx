"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import { StatusBadge } from "@/shared/ui/status-badge";
import { usePairingStore } from "../model/pairing-store";
import { WhatsAppQrModal } from "./whatsapp-qr-modal";

export function PairingStepAuthenticate() {
	const platform = usePairingStore((s) => s.platform);
	const pairingState = usePairingStore((s) => s.pairingState);
	const authData = usePairingStore((s) => s.authData);
	const startPairing = usePairingStore((s) => s.startPairing);
	const setAuthData = usePairingStore((s) => s.setAuthData);

	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [tokenInput, setTokenInput] = useState("");
	const [sidInput, setSidInput] = useState("");
	const [smsTokenInput, setSmsTokenInput] = useState("");
	const [slackStatus, setSlackStatus] = useState<
		"idle" | "redirecting" | "connected"
	>("idle");

	// Auto-advance for web platform (no auth needed)
	const currentStep = usePairingStore((s) => s.currentStep);
	useEffect(() => {
		if (platform === "web" && currentStep === 1) {
			// Small delay to show the "no auth needed" message
			const timer = setTimeout(() => {
				usePairingStore.setState({ currentStep: 2, authData: {} });
			}, 800);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [platform, currentStep]);

	const handleGenerateQr = useCallback(() => {
		startPairing();
		setQrModalOpen(true);
	}, [startPairing]);

	const handleSaveToken = useCallback(() => {
		if (tokenInput.trim()) {
			setAuthData({ botToken: tokenInput.trim() });
		}
	}, [tokenInput, setAuthData]);

	const handleSaveSmsCredentials = useCallback(() => {
		if (sidInput.trim() && smsTokenInput.trim()) {
			setAuthData({ botToken: `${sidInput.trim()}:${smsTokenInput.trim()}` });
		}
	}, [sidInput, smsTokenInput, setAuthData]);

	const handleSlackOAuth = useCallback(() => {
		setSlackStatus("redirecting");
		setTimeout(() => {
			setSlackStatus("connected");
			setAuthData({ oauthCode: "mock-slack-oauth-code-2026" });
		}, 1000);
	}, [setAuthData]);

	const canAdvance =
		authData !== null ||
		platform === "web" ||
		pairingState === "connected";

	const handleNext = useCallback(() => {
		usePairingStore.setState({ currentStep: 2 });
	}, []);

	return (
		<div className="mx-auto max-w-md space-y-6">
			{/* WhatsApp */}
			{platform === "whatsapp" && (
				<div className="space-y-4">
					<h3 className="text-sm font-semibold">Scan QR Code</h3>
					<p className="text-sm text-muted-foreground">
						Generate a QR code and scan it with WhatsApp on your phone to link
						this channel.
					</p>
					<Button onClick={handleGenerateQr}>Generate QR Code</Button>
					{pairingState !== "idle" && (
						<div className="flex items-center gap-2">
							<StatusBadge status={pairingState} />
						</div>
					)}
					<WhatsAppQrModal
						open={qrModalOpen}
						onOpenChange={setQrModalOpen}
					/>
				</div>
			)}

			{/* Telegram */}
			{platform === "telegram" && (
				<div className="space-y-4">
					<FormField
						label="Bot Token"
						description="Get your bot token from @BotFather on Telegram"
						required
					>
						<Input
							placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
							value={tokenInput}
							onChange={(e) => setTokenInput(e.target.value)}
						/>
					</FormField>
					<Button
						onClick={handleSaveToken}
						disabled={!tokenInput.trim()}
					>
						Save Token
					</Button>
					{authData?.botToken && (
						<StatusBadge status="connected" label="Token saved" />
					)}
				</div>
			)}

			{/* Discord */}
			{platform === "discord" && (
				<div className="space-y-4">
					<FormField
						label="Bot Token"
						description="Get your bot token from the Discord Developer Portal"
						required
					>
						<Input
							placeholder="MTAyNjg2NTk0NjY3MDY..."
							value={tokenInput}
							onChange={(e) => setTokenInput(e.target.value)}
						/>
					</FormField>
					<Button
						onClick={handleSaveToken}
						disabled={!tokenInput.trim()}
					>
						Save Token
					</Button>
					{authData?.botToken && (
						<StatusBadge status="connected" label="Token saved" />
					)}
				</div>
			)}

			{/* Slack */}
			{platform === "slack" && (
				<div className="space-y-4">
					<h3 className="text-sm font-semibold">Connect with Slack</h3>
					<p className="text-sm text-muted-foreground">
						Authorize AXion Hub to access your Slack workspace via OAuth.
					</p>
					{slackStatus === "idle" && (
						<Button onClick={handleSlackOAuth}>Connect with Slack</Button>
					)}
					{slackStatus === "redirecting" && (
						<p className="text-sm text-muted-foreground">
							Redirecting to Slack...
						</p>
					)}
					{slackStatus === "connected" && (
						<StatusBadge
							status="connected"
							label="Connected to Slack workspace"
						/>
					)}
				</div>
			)}

			{/* Web */}
			{platform === "web" && (
				<div className="space-y-4">
					<div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
						<p className="text-sm text-muted-foreground">
							No authentication required for web chat. Auto-advancing...
						</p>
					</div>
				</div>
			)}

			{/* SMS */}
			{platform === "sms" && (
				<div className="space-y-4">
					<FormField
						label="Twilio Account SID"
						description="Find this in your Twilio console dashboard"
						required
					>
						<Input
							placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
							value={sidInput}
							onChange={(e) => setSidInput(e.target.value)}
						/>
					</FormField>
					<FormField
						label="Auth Token"
						description="Your Twilio auth token for API access"
						required
					>
						<Input
							type="password"
							placeholder="Your Twilio Auth Token"
							value={smsTokenInput}
							onChange={(e) => setSmsTokenInput(e.target.value)}
						/>
					</FormField>
					<Button
						onClick={handleSaveSmsCredentials}
						disabled={!sidInput.trim() || !smsTokenInput.trim()}
					>
						Save Credentials
					</Button>
					{authData?.botToken && (
						<StatusBadge status="connected" label="Credentials saved" />
					)}
				</div>
			)}

			{/* Next Button */}
			{platform !== "web" && (
				<div className="pt-4 border-t">
					<Button
						onClick={handleNext}
						disabled={!canAdvance}
						className="w-full"
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
