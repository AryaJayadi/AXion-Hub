"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	resetPasswordSchema,
	type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: ResetPasswordFormValues) {
		if (!token) {
			setServerError("Missing reset token. Please request a new password reset link.");
			return;
		}

		setServerError(null);
		setIsLoading(true);

		try {
			const result = await authClient.resetPassword({
				newPassword: data.newPassword,
				token,
			});

			if (result.error) {
				setServerError(
					"This reset link is invalid or has expired. Please request a new one.",
				);
				return;
			}

			setIsSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch {
			setServerError(
				"This reset link is invalid or has expired. Please request a new one.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	if (!token) {
		return (
			<div className="space-y-6">
				<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
					Missing reset token. Please request a new password reset link.
				</div>
				<div className="text-center">
					<Link
						href="/forgot-password"
						className="text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						Request new reset link
					</Link>
				</div>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-3 text-center">
					<CheckCircle2 className="size-12 text-green-500" />
					<p className="text-sm font-medium">Password reset successfully!</p>
					<p className="text-sm text-muted-foreground">
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{serverError && (
				<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
					{serverError}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="newPassword">New password</Label>
					<Input
						id="newPassword"
						type="password"
						placeholder="Enter new password"
						autoComplete="new-password"
						disabled={isLoading}
						aria-invalid={errors.newPassword ? true : undefined}
						{...register("newPassword")}
					/>
					{errors.newPassword && (
						<p className="text-xs text-destructive">
							{errors.newPassword.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm password</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="Confirm new password"
						autoComplete="new-password"
						disabled={isLoading}
						aria-invalid={errors.confirmPassword ? true : undefined}
						{...register("confirmPassword")}
					/>
					{errors.confirmPassword && (
						<p className="text-xs text-destructive">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="size-4 animate-spin" />}
					{isLoading ? "Resetting password..." : "Reset password"}
				</Button>
			</form>

			<div className="text-center">
				<Link
					href="/forgot-password"
					className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
				>
					Request new reset link
				</Link>
			</div>
		</div>
	);
}
