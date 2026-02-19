"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { FormField } from "@/shared/ui/form-field";

import {
	generalSettingsSchema,
	type GeneralSettingsFormValues,
} from "../schemas/settings-schemas";
import { useSaveGeneralSettings } from "../api/use-settings";
import type { GeneralSettings } from "../model/settings-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMEZONES = [
	{ value: "UTC", label: "UTC" },
	{ value: "America/New_York", label: "America/New York (EST)" },
	{ value: "America/Chicago", label: "America/Chicago (CST)" },
	{ value: "America/Denver", label: "America/Denver (MST)" },
	{ value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
	{ value: "Europe/London", label: "Europe/London (GMT)" },
	{ value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
	{ value: "Europe/Paris", label: "Europe/Paris (CET)" },
	{ value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
	{ value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
	{ value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
	{ value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
] as const;

const LANGUAGES = [
	{ value: "en", label: "English" },
	{ value: "es", label: "Spanish" },
	{ value: "fr", label: "French" },
	{ value: "de", label: "German" },
	{ value: "ja", label: "Japanese" },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GeneralSettingsFormProps {
	defaults: GeneralSettings;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GeneralSettingsForm({ defaults }: GeneralSettingsFormProps) {
	const saveMutation = useSaveGeneralSettings();

	const form = useForm<GeneralSettingsFormValues>({
		resolver: zodResolver(generalSettingsSchema) as never,
		defaultValues: defaults,
	});

	async function onSubmit(values: GeneralSettingsFormValues) {
		try {
			await saveMutation.mutateAsync(values);
			toast.success("General settings saved");
		} catch {
			toast.error("Failed to save general settings");
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>General</CardTitle>
				<CardDescription>
					Configure your workspace basics
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6"
				>
					{/* App Name */}
					<FormField
						label="App Name"
						error={form.formState.errors.appName?.message}
						required
					>
						<Input
							{...form.register("appName")}
							placeholder="AXion Hub"
						/>
					</FormField>

					{/* Timezone */}
					<FormField
						label="Timezone"
						error={form.formState.errors.timezone?.message}
						required
					>
						<Select
							value={form.watch("timezone")}
							onValueChange={(value) =>
								form.setValue("timezone", value, {
									shouldValidate: true,
								})
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select timezone" />
							</SelectTrigger>
							<SelectContent>
								{TIMEZONES.map((tz) => (
									<SelectItem key={tz.value} value={tz.value}>
										{tz.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>

					{/* Language */}
					<FormField
						label="Language"
						error={form.formState.errors.language?.message}
						required
					>
						<Select
							value={form.watch("language")}
							onValueChange={(value) =>
								form.setValue("language", value, {
									shouldValidate: true,
								})
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((lang) => (
									<SelectItem
										key={lang.value}
										value={lang.value}
									>
										{lang.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
