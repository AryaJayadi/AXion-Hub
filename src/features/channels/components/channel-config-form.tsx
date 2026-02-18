"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Channel } from "@/entities/channel";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	channelConfigSchema,
	type ChannelConfigFormValues,
} from "../schemas/channel-schemas";
import { useUpdateChannel, MOCK_AGENT_OPTIONS } from "../api/use-channels";

interface ChannelConfigFormProps {
	channel: Channel;
}

export function ChannelConfigForm({ channel }: ChannelConfigFormProps) {
	const updateChannel = useUpdateChannel();

	const form = useForm<ChannelConfigFormValues>({
		// biome-ignore lint/suspicious/noExplicitAny: Zod v4 + exactOptionalPropertyTypes requires as any cast for zodResolver
		resolver: zodResolver(channelConfigSchema as any),
		defaultValues: {
			name: channel.name,
			platform: channel.platform,
			agentId: channel.agentId,
			phoneNumber: channel.phoneNumber ?? "",
			botToken: "",
			webhookUrl: "",
		},
	});

	const onSubmit = (values: ChannelConfigFormValues) => {
		updateChannel.mutate({
			channelId: channel.id,
			values: {
				name: values.name,
				agentId: values.agentId,
				phoneNumber: values.phoneNumber || undefined,
				botToken: values.botToken || undefined,
				webhookUrl: values.webhookUrl || undefined,
			},
		});
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor="name">Channel Name</Label>
				<Input id="name" {...form.register("name")} />
				{form.formState.errors.name && (
					<p className="text-sm text-destructive">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			{/* Platform (read-only) */}
			<div className="space-y-2">
				<Label>Platform</Label>
				<div>
					<Badge variant="outline" className="text-sm capitalize">
						{channel.platform}
					</Badge>
				</div>
			</div>

			{/* Agent Assignment */}
			<div className="space-y-2">
				<Label htmlFor="agentId">Assigned Agent</Label>
				<Select
					value={form.watch("agentId") ?? "none"}
					onValueChange={(v) =>
						form.setValue("agentId", v === "none" ? null : v, {
							shouldDirty: true,
						})
					}
				>
					<SelectTrigger id="agentId">
						<SelectValue placeholder="Select agent..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">Unrouted</SelectItem>
						{MOCK_AGENT_OPTIONS.map((agent) => (
							<SelectItem key={agent.id} value={agent.id}>
								{agent.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Platform-specific fields */}
			{channel.platform === "whatsapp" && (
				<div className="space-y-2">
					<Label htmlFor="phoneNumber">Phone Number</Label>
					<Input
						id="phoneNumber"
						placeholder="+1 (555) 000-0000"
						{...form.register("phoneNumber")}
					/>
				</div>
			)}

			{channel.platform === "telegram" && (
				<div className="space-y-2">
					<Label htmlFor="botToken">Bot Token</Label>
					<Input
						id="botToken"
						type="password"
						placeholder="Enter Telegram bot token"
						{...form.register("botToken")}
					/>
				</div>
			)}

			{(channel.platform === "discord" ||
				channel.platform === "slack") && (
				<div className="space-y-2">
					<Label htmlFor="webhookUrl">Webhook URL</Label>
					<Input
						id="webhookUrl"
						placeholder="https://..."
						{...form.register("webhookUrl")}
					/>
					{form.formState.errors.webhookUrl && (
						<p className="text-sm text-destructive">
							{form.formState.errors.webhookUrl.message}
						</p>
					)}
				</div>
			)}

			{/* Submit */}
			<Button
				type="submit"
				disabled={
					!form.formState.isDirty || updateChannel.isPending
				}
			>
				{updateChannel.isPending ? "Saving..." : "Save Changes"}
			</Button>
		</form>
	);
}
