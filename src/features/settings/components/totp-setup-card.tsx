"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import {
	Check,
	ChevronDown,
	Copy,
	Loader2,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/features/auth/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { StatusBadge } from "@/shared/ui/status-badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "idle" | "password" | "scan" | "verify" | "enabled";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TotpSetupCard() {
	const session = authClient.useSession();
	const isTwoFactorEnabled = !!(session.data?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled;

	const [step, setStep] = useState<Step>(
		isTwoFactorEnabled ? "enabled" : "idle",
	);
	const [password, setPassword] = useState("");
	const [totpURI, setTotpURI] = useState<string | null>(null);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verifyCode, setVerifyCode] = useState("");
	const [showManualKey, setShowManualKey] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [disablePassword, setDisablePassword] = useState("");

	// -----------------------------------------------------------------------
	// Extract TOTP secret from URI
	// -----------------------------------------------------------------------
	function extractSecret(uri: string): string {
		try {
			const url = new URL(uri);
			return url.searchParams.get("secret") ?? "";
		} catch {
			return "";
		}
	}

	// -----------------------------------------------------------------------
	// Enable 2FA (password -> QR code + backup codes)
	// -----------------------------------------------------------------------
	async function handleEnable() {
		if (!password) return;
		setIsLoading(true);
		try {
			const { data, error } = await authClient.twoFactor.enable({
				password,
			});
			if (error) {
				toast.error("Failed to enable 2FA. Check your password.");
				return;
			}
			setTotpURI(data.totpURI);
			setBackupCodes(data.backupCodes);
			setStep("scan");
			setPassword("");
		} catch {
			toast.error("Failed to enable 2FA");
		} finally {
			setIsLoading(false);
		}
	}

	// -----------------------------------------------------------------------
	// Verify TOTP code from authenticator app
	// -----------------------------------------------------------------------
	async function handleVerify() {
		if (!verifyCode || verifyCode.length !== 6) return;
		setIsLoading(true);
		try {
			const { error } = await authClient.twoFactor.verifyTOTP({
				code: verifyCode,
			});
			if (error) {
				toast.error("Invalid code. Please try again.");
				return;
			}
			toast.success("Two-factor authentication enabled");
			setStep("enabled");
			setVerifyCode("");
			setTotpURI(null);
			setBackupCodes([]);
		} catch {
			toast.error("Failed to verify code");
		} finally {
			setIsLoading(false);
		}
	}

	// -----------------------------------------------------------------------
	// Disable 2FA
	// -----------------------------------------------------------------------
	async function handleDisable() {
		if (!disablePassword) return;
		setIsLoading(true);
		try {
			const { error } = await authClient.twoFactor.disable({
				password: disablePassword,
			});
			if (error) {
				toast.error("Failed to disable 2FA. Check your password.");
				return;
			}
			toast.success("Two-factor authentication disabled");
			setStep("idle");
			setDisablePassword("");
		} catch {
			toast.error("Failed to disable 2FA");
		} finally {
			setIsLoading(false);
		}
	}

	// -----------------------------------------------------------------------
	// Copy backup codes to clipboard
	// -----------------------------------------------------------------------
	async function copyBackupCodes() {
		try {
			await navigator.clipboard.writeText(backupCodes.join("\n"));
			toast.success("Backup codes copied to clipboard");
		} catch {
			toast.error("Failed to copy backup codes");
		}
	}

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------
	return (
		<Card>
			<CardHeader>
				<CardTitle>Two-Factor Authentication</CardTitle>
				<CardDescription>
					Add an extra layer of security using TOTP
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* ----- IDLE: Not enabled ----- */}
				{step === "idle" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Two-factor authentication adds an extra layer of
							security to your account by requiring a code from
							your authenticator app when signing in.
						</p>
						<Button onClick={() => setStep("password")}>
							Enable Two-Factor Authentication
						</Button>
					</div>
				)}

				{/* ----- PASSWORD: Enter password to start setup ----- */}
				{step === "password" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Enter your current password to begin 2FA setup.
						</p>
						<FormField label="Current Password" required>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleEnable();
									}
								}}
							/>
						</FormField>
						<div className="flex gap-2">
							<Button
								onClick={handleEnable}
								disabled={!password || isLoading}
							>
								{isLoading && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Continue
							</Button>
							<Button
								variant="ghost"
								onClick={() => {
									setStep("idle");
									setPassword("");
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}

				{/* ----- SCAN: QR code + backup codes ----- */}
				{step === "scan" && totpURI && (
					<div className="space-y-6">
						{/* QR Code */}
						<div className="space-y-2">
							<p className="text-sm font-medium">
								Scan this QR code with your authenticator app
							</p>
							<div className="flex justify-center rounded-lg bg-white p-6">
								<QRCode value={totpURI} size={200} />
							</div>
						</div>

						{/* Manual key entry */}
						<div>
							<button
								type="button"
								onClick={() =>
									setShowManualKey(!showManualKey)
								}
								className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<ChevronDown
									className={`size-4 transition-transform ${showManualKey ? "rotate-180" : ""}`}
								/>
								Can&#39;t scan? Enter this code manually
							</button>
							{showManualKey && (
								<div className="mt-2 rounded-md border bg-muted/50 p-3">
									<code className="break-all text-sm font-mono">
										{extractSecret(totpURI)}
									</code>
								</div>
							)}
						</div>

						{/* Backup codes */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">
									Backup Codes
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={copyBackupCodes}
								>
									<Copy className="size-3" />
									Copy All
								</Button>
							</div>
							<div className="rounded-md border p-3">
								<div className="grid grid-cols-2 gap-1">
									{backupCodes.map((code) => (
										<code
											key={code}
											className="text-sm font-mono text-muted-foreground"
										>
											{code}
										</code>
									))}
								</div>
							</div>
							<p className="text-xs text-warning">
								Save these backup codes. They won&#39;t be
								shown again.
							</p>
						</div>

						<Button onClick={() => setStep("verify")}>
							Continue
						</Button>
					</div>
				)}

				{/* ----- VERIFY: Enter TOTP code ----- */}
				{step === "verify" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Enter the 6-digit code from your authenticator app
							to verify setup.
						</p>
						<FormField label="Verification Code" required>
							<Input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={verifyCode}
								onChange={(e) =>
									setVerifyCode(
										e.target.value.replace(/\D/g, ""),
									)
								}
								placeholder="000000"
								className="max-w-[160px] font-mono text-center tracking-widest"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleVerify();
									}
								}}
							/>
						</FormField>
						<div className="flex gap-2">
							<Button
								onClick={handleVerify}
								disabled={
									verifyCode.length !== 6 || isLoading
								}
							>
								{isLoading && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Verify
							</Button>
							<Button
								variant="ghost"
								onClick={() => {
									setStep("idle");
									setVerifyCode("");
									setTotpURI(null);
									setBackupCodes([]);
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}

				{/* ----- ENABLED: 2FA is active ----- */}
				{step === "enabled" && (
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<ShieldCheck className="size-5 text-secondary" />
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">
									Two-factor authentication is enabled
								</span>
								<StatusBadge
									status="active"
									label="Enabled"
									size="sm"
									showDot={false}
								/>
							</div>
						</div>

						{/* Disable flow */}
						<div className="space-y-3 rounded-md border border-destructive/30 p-4">
							<div className="flex items-center gap-2">
								<ShieldOff className="size-4 text-destructive" />
								<span className="text-sm font-medium">
									Disable Two-Factor Authentication
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Enter your password to disable 2FA. This will
								make your account less secure.
							</p>
							<FormField label="Password" required>
								<Input
									type="password"
									value={disablePassword}
									onChange={(e) =>
										setDisablePassword(e.target.value)
									}
									placeholder="Enter your password"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleDisable();
										}
									}}
								/>
							</FormField>
							<Button
								variant="destructive"
								onClick={handleDisable}
								disabled={!disablePassword || isLoading}
							>
								{isLoading && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Disable 2FA
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
