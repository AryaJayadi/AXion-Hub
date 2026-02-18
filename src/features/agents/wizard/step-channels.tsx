"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { channelsSchema, type ChannelsFormValues } from "../schemas/wizard-schemas";
import { useWizardStore } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface StepChannelsProps {
	onNext: () => void;
}

export function StepChannels({ onNext }: StepChannelsProps) {
	const channels = useWizardStore((s) => s.channels);
	const setChannels = useWizardStore((s) => s.setChannels);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
	const { register, handleSubmit, control } = useForm<ChannelsFormValues>({
		resolver: zodResolver(channelsSchema) as any,
		defaultValues: {
			bindings: channels?.bindings ?? [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "bindings",
	});

	function onSubmit(data: ChannelsFormValues) {
		setChannels(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Channel Routing</h2>
				<p className="text-sm text-muted-foreground">
					Configure which channels this agent listens to and the routing rules.
					Channels will be available after gateway connection.
				</p>
			</div>

			{/* Bindings List */}
			<div className="space-y-3">
				<Label>Channel Bindings</Label>

				{fields.length === 0 && (
					<div className="rounded-lg border border-dashed p-6 text-center">
						<p className="text-sm text-muted-foreground">
							No channel bindings configured yet. Add a binding to route
							messages to this agent.
						</p>
					</div>
				)}

				{fields.map((field, index) => (
					<div
						key={field.id}
						className="flex items-end gap-3 rounded-lg border p-3"
					>
						<div className="flex-1 space-y-1.5">
							<Label htmlFor={`channel-id-${index}`} className="text-xs">
								Channel ID
							</Label>
							<Input
								id={`channel-id-${index}`}
								placeholder="channel-id"
								{...register(`bindings.${index}.channelId`)}
							/>
						</div>
						<div className="flex-1 space-y-1.5">
							<Label htmlFor={`channel-rule-${index}`} className="text-xs">
								Rule
							</Label>
							<Input
								id={`channel-rule-${index}`}
								placeholder="e.g. all, @mention, keyword:help"
								{...register(`bindings.${index}.rule`)}
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => remove(index)}
						>
							<Trash2 className="size-4 text-destructive" />
						</Button>
					</div>
				))}

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => append({ channelId: "", rule: "" })}
				>
					<Plus className="size-4" />
					Add Binding
				</Button>
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
