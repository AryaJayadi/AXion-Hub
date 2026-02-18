"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import {
	channelGroupSettingsSchema,
	type ChannelGroupSettingsFormValues,
} from "../schemas/channel-schemas";

interface ChannelGroupSettingsProps {
	channelId: string;
}

export function ChannelGroupSettings({
	channelId,
}: ChannelGroupSettingsProps) {
	const form = useForm<ChannelGroupSettingsFormValues>({
		// biome-ignore lint/suspicious/noExplicitAny: Zod v4 + exactOptionalPropertyTypes requires as any cast for zodResolver
		resolver: zodResolver(channelGroupSettingsSchema as any),
		defaultValues: {
			allowlist: ["general", "support"],
			mentionPatterns: ["@axion", "@bot"],
			broadcastEnabled: false,
		},
	});

	const allowlistField = useFieldArray({
		control: form.control,
		// useFieldArray expects an array of objects, but we have string arrays.
		// We wrap them as { value: string } internally.
		name: "allowlist" as never,
	});

	const mentionField = useFieldArray({
		control: form.control,
		name: "mentionPatterns" as never,
	});

	const onSubmit = async (_values: ChannelGroupSettingsFormValues) => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 500));
		toast.success("Group settings saved", {
			description: `Updated group settings for channel ${channelId}.`,
		});
	};

	// Since useFieldArray works best with object arrays but we have string[],
	// we use register directly with index-based names
	const allowlistValues = form.watch("allowlist");
	const mentionValues = form.watch("mentionPatterns");

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Allowlist */}
			<div className="space-y-3">
				<Label>Group Allowlist</Label>
				<p className="text-sm text-muted-foreground">
					Only these groups/channels will be monitored for messages.
				</p>
				<div className="space-y-2">
					{allowlistValues.map((_, index) => (
						<div
							key={`allowlist-${index.toString()}`}
							className="flex items-center gap-2"
						>
							<Input
								{...form.register(`allowlist.${index}`)}
								placeholder="Group name or ID"
								className="flex-1"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => {
									const current = form.getValues("allowlist");
									form.setValue(
										"allowlist",
										current.filter((_, i) => i !== index),
										{ shouldDirty: true },
									);
								}}
							>
								<Trash2 className="size-4 text-muted-foreground" />
							</Button>
						</div>
					))}
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						const current = form.getValues("allowlist");
						form.setValue("allowlist", [...current, ""], {
							shouldDirty: true,
						});
					}}
				>
					<Plus className="mr-1 size-3" />
					Add Group
				</Button>
			</div>

			{/* Mention Patterns */}
			<div className="space-y-3">
				<Label>Mention Patterns</Label>
				<p className="text-sm text-muted-foreground">
					Regex patterns that trigger agent responses in group
					channels.
				</p>
				<div className="space-y-2">
					{mentionValues.map((_, index) => (
						<div
							key={`mention-${index.toString()}`}
							className="flex items-center gap-2"
						>
							<Input
								{...form.register(`mentionPatterns.${index}`)}
								placeholder="@pattern or regex"
								className="flex-1"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => {
									const current =
										form.getValues("mentionPatterns");
									form.setValue(
										"mentionPatterns",
										current.filter((_, i) => i !== index),
										{ shouldDirty: true },
									);
								}}
							>
								<Trash2 className="size-4 text-muted-foreground" />
							</Button>
						</div>
					))}
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						const current = form.getValues("mentionPatterns");
						form.setValue("mentionPatterns", [...current, ""], {
							shouldDirty: true,
						});
					}}
				>
					<Plus className="mr-1 size-3" />
					Add Pattern
				</Button>
			</div>

			{/* Broadcast Toggle */}
			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label>Broadcast Mode</Label>
					<p className="text-sm text-muted-foreground">
						Enable the agent to send broadcast messages to all group
						members.
					</p>
				</div>
				<Switch
					checked={form.watch("broadcastEnabled")}
					onCheckedChange={(checked) =>
						form.setValue("broadcastEnabled", checked, {
							shouldDirty: true,
						})
					}
				/>
			</div>

			{/* Submit */}
			<Button
				type="submit"
				disabled={!form.formState.isDirty}
			>
				Save Group Settings
			</Button>
		</form>
	);
}
