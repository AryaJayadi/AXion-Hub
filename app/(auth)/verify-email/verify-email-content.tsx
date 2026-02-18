"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck, CheckCircle2 } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import { Button } from "@/shared/ui/button";

export function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const [isResending, setIsResending] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState<string | null>(null);

	async function handleResend() {
		if (!email) return;
		setIsResending(true);
		setResendError(null);
		setResendSuccess(false);

		try {
			await authClient.sendVerificationEmail({
				email,
				callbackURL: "/login",
			});
			setResendSuccess(true);
		} catch {
			setResendError("Failed to resend verification email. Please try again.");
		} finally {
			setIsResending(false);
		}
	}

	// No email param -- generic success state (user clicked verification link)
	if (!email) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-3 text-center">
					<CheckCircle2 className="size-12 text-green-500" />
					<p className="text-sm font-medium">Email verified successfully!</p>
					<p className="text-sm text-muted-foreground">
						You can now sign in to your account.
					</p>
				</div>
				<div className="text-center">
					<Link
						href="/login"
						className="text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						Go to login
					</Link>
				</div>
			</div>
		);
	}

	// Waiting mode -- show "check your inbox"
	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center gap-3 text-center">
				<MailCheck className="size-12 text-primary" />
				<p className="text-sm text-muted-foreground">
					We&apos;ve sent a verification email to{" "}
					<span className="font-medium text-foreground">{email}</span>.
					Please check your inbox and click the link to verify your account.
				</p>
			</div>

			{resendSuccess && (
				<div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
					Verification email resent successfully.
				</div>
			)}

			{resendError && (
				<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
					{resendError}
				</div>
			)}

			<div className="space-y-3">
				<Button
					variant="outline"
					className="w-full"
					disabled={isResending || resendSuccess}
					onClick={handleResend}
				>
					{isResending && <Loader2 className="size-4 animate-spin" />}
					{isResending
						? "Resending..."
						: resendSuccess
							? "Email sent"
							: "Resend verification email"}
				</Button>

				<p className="text-center text-sm text-muted-foreground">
					Already verified?{" "}
					<Link
						href="/login"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
