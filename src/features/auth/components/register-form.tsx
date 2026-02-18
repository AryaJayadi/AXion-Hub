"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	registerSchema,
	type RegisterFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";

function getPasswordStrength(password: string) {
	if (password.length === 0) return { level: 0, label: "", color: "" };
	if (password.length < 8)
		return { level: 1, label: "Weak", color: "bg-destructive" };

	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const allCriteria = hasUpper && hasLower && hasNumber;

	if (password.length >= 12 && allCriteria)
		return { level: 3, label: "Strong", color: "bg-green-500" };
	if (password.length >= 8)
		return { level: 2, label: "Fair", color: "bg-yellow-500" };

	return { level: 1, label: "Weak", color: "bg-destructive" };
}

export function RegisterForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			agreeToTerms: false as unknown as true,
		},
	});

	const passwordValue = watch("password");
	const agreeToTermsValue = watch("agreeToTerms");
	const strength = getPasswordStrength(passwordValue);

	async function onSubmit(data: RegisterFormValues) {
		setServerError(null);
		setIsLoading(true);

		try {
			const result = await authClient.signUp.email({
				name: data.name,
				email: data.email,
				password: data.password,
			});

			if (result.error) {
				if (
					result.error.message?.toLowerCase().includes("already exists") ||
					result.error.message?.toLowerCase().includes("already registered")
				) {
					setServerError(
						"An account with this email already exists. Please sign in instead.",
					);
				} else {
					setServerError(
						result.error.message || "Registration failed. Please try again.",
					);
				}
				return;
			}

			router.push(
				`/verify-email?email=${encodeURIComponent(data.email)}`,
			);
		} catch {
			setServerError("Registration failed. Please try again.");
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
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						type="text"
						placeholder="Your name"
						autoComplete="name"
						disabled={isLoading}
						aria-invalid={errors.name ? true : undefined}
						{...register("name")}
					/>
					{errors.name && (
						<p className="text-xs text-destructive">{errors.name.message}</p>
					)}
				</div>

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
						placeholder="Create a password"
						autoComplete="new-password"
						disabled={isLoading}
						aria-invalid={errors.password ? true : undefined}
						{...register("password")}
					/>
					{/* Password strength indicator */}
					{passwordValue.length > 0 && (
						<div className="space-y-1">
							<div className="flex h-1.5 gap-1">
								<div
									className={`h-full flex-1 rounded-full transition-colors ${
										strength.level >= 1 ? strength.color : "bg-muted"
									}`}
								/>
								<div
									className={`h-full flex-1 rounded-full transition-colors ${
										strength.level >= 2 ? strength.color : "bg-muted"
									}`}
								/>
								<div
									className={`h-full flex-1 rounded-full transition-colors ${
										strength.level >= 3 ? strength.color : "bg-muted"
									}`}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								{strength.label}
							</p>
						</div>
					)}
					{errors.password && (
						<p className="text-xs text-destructive">
							{errors.password.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-start gap-2">
						<Checkbox
							id="agreeToTerms"
							checked={agreeToTermsValue === true}
							onCheckedChange={(checked) => {
								setValue("agreeToTerms", checked === true ? true : (false as unknown as true), {
									shouldValidate: true,
								});
							}}
							disabled={isLoading}
							aria-invalid={errors.agreeToTerms ? true : undefined}
						/>
						<label
							htmlFor="agreeToTerms"
							className="text-sm leading-snug text-muted-foreground"
						>
							I agree to the{" "}
							<Link
								href="/terms"
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy"
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								Privacy Policy
							</Link>
						</label>
					</div>
					{errors.agreeToTerms && (
						<p className="text-xs text-destructive">
							{errors.agreeToTerms.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="size-4 animate-spin" />}
					{isLoading ? "Creating account..." : "Create account"}
				</Button>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					href="/login"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
