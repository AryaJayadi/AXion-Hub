"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	loginSchema,
	type LoginFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { SocialLoginButtons } from "@/features/auth/components/social-login-buttons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: LoginFormValues) {
		setServerError(null);
		setIsLoading(true);

		try {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				callbackURL: callbackUrl,
			});

			if (result.error) {
				if (result.error.status === 403) {
					setServerError(
						"Please verify your email address before signing in.",
					);
				} else {
					setServerError(
						"Invalid email or password. Please try again.",
					);
				}
				return;
			}

			router.push(callbackUrl);
		} catch {
			setServerError("Invalid email or password. Please try again.");
		} finally {
			setIsLoading(false);
		}
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

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						autoComplete="current-password"
						disabled={isLoading}
						aria-invalid={errors.password ? true : undefined}
						{...register("password")}
					/>
					{errors.password && (
						<p className="text-xs text-destructive">
							{errors.password.message}
						</p>
					)}
				</div>

				<div className="flex justify-end">
					<Link
						href="/forgot-password"
						className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
					>
						Forgot your password?
					</Link>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="size-4 animate-spin" />}
					{isLoading ? "Signing in..." : "Sign in"}
				</Button>
			</form>

			<SocialLoginButtons callbackUrl={callbackUrl} />

			<p className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{" "}
				<Link
					href="/register"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}
