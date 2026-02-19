"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";

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

import { useChangePassword } from "../api/use-security";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PasswordChangeForm() {
	const changePassword = useChangePassword();

	const form = useForm<PasswordChangeFormValues>({
		resolver: zodResolver(passwordChangeSchema) as never,
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: PasswordChangeFormValues) {
		await changePassword.mutateAsync({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		});
		form.reset();
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>Change your password</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormField
						label="Current Password"
						error={form.formState.errors.currentPassword?.message}
						required
					>
						<Input
							type="password"
							{...form.register("currentPassword")}
							placeholder="Enter current password"
						/>
					</FormField>

					<FormField
						label="New Password"
						error={form.formState.errors.newPassword?.message}
						required
					>
						<Input
							type="password"
							{...form.register("newPassword")}
							placeholder="Enter new password"
						/>
					</FormField>

					<FormField
						label="Confirm New Password"
						error={form.formState.errors.confirmPassword?.message}
						required
					>
						<Input
							type="password"
							{...form.register("confirmPassword")}
							placeholder="Confirm new password"
						/>
					</FormField>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Save
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
