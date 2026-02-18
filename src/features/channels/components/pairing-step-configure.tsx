"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { usePairingStore } from "../model/pairing-store";
import { MOCK_AGENT_OPTIONS } from "../api/use-channels";

const configSchema = z.object({
	name: z.string().min(1, "Channel name is required"),
	agentId: z.string(),
	description: z.string(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

/** Format platform name for display */
function platformLabel(platform: string | null): string {
	if (!platform) return "";
	return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function PairingStepConfigure() {
	const platform = usePairingStore((s) => s.platform);
	const setChannelConfig = usePairingStore((s) => s.setChannelConfig);

	const form = useForm<ConfigFormValues>({
		resolver: zodResolver(configSchema) as never,
		defaultValues: {
			name: `${platformLabel(platform)} Channel`,
			agentId: "",
			description: "",
		},
	});

	const handleSubmit = useCallback(
		(values: ConfigFormValues) => {
			setChannelConfig({
				name: values.name,
				agentId: values.agentId || null,
			});
			usePairingStore.setState({ currentStep: 3 });
		},
		[setChannelConfig],
	);

	return (
		<form
			onSubmit={form.handleSubmit(handleSubmit)}
			className="mx-auto max-w-md space-y-6"
		>
			<FormField
				label="Channel Name"
				error={form.formState.errors.name?.message}
				required
			>
				<Input
					{...form.register("name")}
					placeholder="My Channel"
				/>
			</FormField>

			<FormField
				label="Assign Agent"
				description="Choose an agent to handle messages on this channel"
			>
				<Select
					value={form.watch("agentId")}
					onValueChange={(value) => form.setValue("agentId", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Unassigned" />
					</SelectTrigger>
					<SelectContent>
						{MOCK_AGENT_OPTIONS.map((agent) => (
							<SelectItem key={agent.id} value={agent.id}>
								{agent.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Description"
				description="Optional description for this channel"
			>
				<Textarea
					{...form.register("description")}
					placeholder="What is this channel used for?"
					rows={3}
				/>
			</FormField>

			<Button type="submit" className="w-full">
				Next
			</Button>
		</form>
	);
}
