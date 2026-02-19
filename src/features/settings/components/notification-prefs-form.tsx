"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

import {
	notificationPrefsSchema,
	type NotificationPrefsFormValues,
} from "../schemas/settings-schemas";
import { useSaveNotificationPrefs } from "../api/use-notifications";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NotificationPrefsFormProps {
	defaults: NotificationPrefsFormValues;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationPrefsForm({ defaults }: NotificationPrefsFormProps) {
	const saveMutation = useSaveNotificationPrefs();

	const form = useForm<NotificationPrefsFormValues>({
		resolver: zodResolver(notificationPrefsSchema) as never,
		defaultValues: defaults,
	});

	const emailEnabled = form.watch("emailEnabled");
	const webhookEnabled = form.watch("webhookEnabled");
	const slackEnabled = form.watch("slackEnabled");
	const discordEnabled = form.watch("discordEnabled");

	async function onSubmit(values: NotificationPrefsFormValues) {
		await saveMutation.mutateAsync(values);
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<div className="space-y-6">
				{/* Email Notifications */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Email Notifications</CardTitle>
						<CardDescription>
							Receive alerts and summaries via email
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-3">
							<Switch
								checked={emailEnabled}
								onCheckedChange={(checked) =>
									form.setValue("emailEnabled", checked === true)
								}
							/>
							<Label>Enable email notifications</Label>
						</div>
					</CardContent>
				</Card>

				{/* Webhook */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Webhook</CardTitle>
						<CardDescription>
							Send events to a custom webhook endpoint
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Switch
								checked={webhookEnabled}
								onCheckedChange={(checked) =>
									form.setValue("webhookEnabled", checked === true)
								}
							/>
							<Label>Enable webhook notifications</Label>
						</div>
						{webhookEnabled && (
							<div className="space-y-2">
								<Label>Webhook URL</Label>
								<Input
									{...form.register("webhookUrl")}
									type="url"
									placeholder="https://example.com/webhook"
								/>
								{form.formState.errors.webhookUrl?.message && (
									<p className="text-xs text-destructive">
										{form.formState.errors.webhookUrl.message}
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Slack */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Slack</CardTitle>
						<CardDescription>
							Post notifications to a Slack channel
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Switch
								checked={slackEnabled}
								onCheckedChange={(checked) =>
									form.setValue("slackEnabled", checked === true)
								}
							/>
							<Label>Enable Slack notifications</Label>
						</div>
						{slackEnabled && (
							<div className="space-y-2">
								<Label>Slack Webhook URL</Label>
								<Input
									{...form.register("slackWebhookUrl")}
									placeholder="https://hooks.slack.com/services/..."
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Discord */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Discord</CardTitle>
						<CardDescription>
							Post notifications to a Discord channel
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Switch
								checked={discordEnabled}
								onCheckedChange={(checked) =>
									form.setValue("discordEnabled", checked === true)
								}
							/>
							<Label>Enable Discord notifications</Label>
						</div>
						{discordEnabled && (
							<div className="space-y-2">
								<Label>Discord Webhook URL</Label>
								<Input
									{...form.register("discordWebhookUrl")}
									placeholder="https://discord.com/api/webhooks/..."
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex justify-end">
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Save
					</Button>
				</div>
			</div>
		</form>
	);
}
