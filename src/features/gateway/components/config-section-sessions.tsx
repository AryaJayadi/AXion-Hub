"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SessionsConfig } from "@/entities/gateway-config";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { sessionsConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionSessionsProps {
	values: SessionsConfig;
	onUpdate: (values: SessionsConfig) => void;
}

export function ConfigSectionSessions({
	values,
	onUpdate,
}: ConfigSectionSessionsProps) {
	const {
		register,
		watch,
		control,
		formState: { errors },
	} = useForm<SessionsConfig>({
		resolver: zodResolver(sessionsConfigSchema as never),
		defaultValues: values,
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate({
					...formValues,
					maxDuration: Number(formValues.maxDuration),
					compactionThreshold: Number(formValues.compactionThreshold),
					maxTokens: Number(formValues.maxTokens),
				} as SessionsConfig);
			}, 300);
			return () => clearTimeout(timer);
		});
		return () => subscription.unsubscribe();
	}, [watch, onUpdate]);

	return (
		<div className="space-y-6">
			<FormField
				label="Max Duration"
				description="Maximum session duration in seconds"
				error={errors.maxDuration?.message}
			>
				<Input
					{...register("maxDuration", { valueAsNumber: true })}
					type="number"
					placeholder="3600"
				/>
			</FormField>

			<FormField
				label="Compaction Threshold"
				description="Token count that triggers automatic compaction"
				error={errors.compactionThreshold?.message}
			>
				<Input
					{...register("compactionThreshold", { valueAsNumber: true })}
					type="number"
					placeholder="100000"
				/>
			</FormField>

			<FormField
				label="Max Tokens"
				description="Maximum token budget per session"
				error={errors.maxTokens?.message}
			>
				<Input
					{...register("maxTokens", { valueAsNumber: true })}
					type="number"
					placeholder="200000"
				/>
			</FormField>

			<div className="flex items-center gap-3">
				<Controller
					control={control}
					name="branchingEnabled"
					render={({ field }) => (
						<Switch
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<Label>Enable Session Branching</Label>
			</div>
		</div>
	);
}
