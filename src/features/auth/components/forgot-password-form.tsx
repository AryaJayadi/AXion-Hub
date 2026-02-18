"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	forgotPasswordSchema,
	type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function ForgotPasswordForm() {
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(data: ForgotPasswordFormValues) {
		setServerError(null);
		setIsLoading(true);

		try {
			await authClient.requestPasswordReset({
				email: data.email,
				redirectTo: "/reset-password",
			});

			// Always show success regardless of whether the email exists (security)
			setIsSuccess(true);
		} catch {
			// Even on error, show the same success message to not reveal if email exists
			setIsSuccess(true);
		} finally {
			setIsLoading(false);
		}
	}

	if (isSuccess) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-3 text-center">
					<CheckCircle2 className="size-12 text-green-500" />
					<p className="text-sm text-muted-foreground">
						If an account exists with this email, you&apos;ll receive a
						password reset link.
					</p>
				</div>
				<div className="text-center">
					<Link
						href="/login"
						className="text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						Back to login
					</Link>
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
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						autoComplete="email"
						disabled={isLoading}
						aria-invalid={errors.email ? true : undefined}
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-xs text-destructive">{errors.email.message}</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="size-4 animate-spin" />}
					{isLoading ? "Sending reset link..." : "Send reset link"}
				</Button>
			</form>

			<div className="text-center">
				<Link
					href="/login"
					className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
				>
					Back to login
				</Link>
			</div>
		</div>
	);
}
