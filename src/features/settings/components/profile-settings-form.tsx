"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/features/auth/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
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

import {
	profileSettingsSchema,
	type ProfileSettingsFormValues,
} from "../schemas/settings-schemas";
import type { ProfileSettings } from "../model/settings-types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProfileSettingsFormProps {
	defaults: ProfileSettings;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileSettingsForm({ defaults }: ProfileSettingsFormProps) {
	const form = useForm<ProfileSettingsFormValues>({
		resolver: zodResolver(profileSettingsSchema) as never,
		defaultValues: {
			displayName: defaults.displayName,
			avatar: defaults.avatar ?? "",
		},
	});

	const avatarUrl = form.watch("avatar");
	const displayName = form.watch("displayName");

	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.join("")
		.toUpperCase()
		.slice(0, 2);

	async function onSubmit(values: ProfileSettingsFormValues) {
		try {
			await authClient.updateUser({
				name: values.displayName,
				image: values.avatar || null,
			});
			toast.success("Profile updated");
		} catch {
			toast.error("Failed to update profile");
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Manage your personal information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6"
				>
					{/* Avatar Preview */}
					<div className="flex items-center gap-4">
						<Avatar className="size-16">
							{avatarUrl ? (
								<AvatarImage
									src={avatarUrl}
									alt={displayName}
								/>
							) : null}
							<AvatarFallback className="text-lg">
								{initials || "?"}
							</AvatarFallback>
						</Avatar>
						<div className="text-sm text-muted-foreground">
							Your avatar is displayed across the workspace
						</div>
					</div>

					{/* Display Name */}
					<FormField
						label="Display Name"
						error={form.formState.errors.displayName?.message}
						required
					>
						<Input
							{...form.register("displayName")}
							placeholder="Your name"
						/>
					</FormField>

					{/* Avatar URL */}
					<FormField
						label="Avatar URL"
						description="Enter a URL for your profile picture"
						error={form.formState.errors.avatar?.message}
					>
						<Input
							{...form.register("avatar")}
							placeholder="https://example.com/avatar.jpg"
						/>
					</FormField>

					{/* Submit */}
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
