"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MemorySearchConfig } from "@/entities/gateway-config";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { memorySearchConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionMemoryProps {
	values: MemorySearchConfig;
	onUpdate: (values: MemorySearchConfig) => void;
}

export function ConfigSectionMemory({
	values,
	onUpdate,
}: ConfigSectionMemoryProps) {
	const {
		register,
		watch,
		control,
		formState: { errors },
	} = useForm<MemorySearchConfig>({
		resolver: zodResolver(memorySearchConfigSchema as never),
		defaultValues: values,
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate({
					enabled: formValues.enabled ?? values.enabled,
					vectorModel: formValues.vectorModel ?? values.vectorModel,
					maxResults: Number(formValues.maxResults ?? values.maxResults),
					minScore: Number(formValues.minScore ?? values.minScore),
				});
			}, 300);
			return () => clearTimeout(timer);
		});
		return () => subscription.unsubscribe();
	}, [watch, onUpdate, values]);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Controller
					control={control}
					name="enabled"
					render={({ field }) => (
						<Switch
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<Label>Enable Memory Search</Label>
			</div>

			<FormField
				label="Vector Model"
				description="Embedding model used for similarity search"
				error={errors.vectorModel?.message}
				required
			>
				<Input
					{...register("vectorModel")}
					placeholder="text-embedding-3-small"
				/>
			</FormField>

			<FormField
				label="Max Results"
				description="Maximum number of memory results to return"
				error={errors.maxResults?.message}
			>
				<Input
					{...register("maxResults", { valueAsNumber: true })}
					type="number"
					placeholder="10"
				/>
			</FormField>

			<FormField
				label="Min Score"
				description="Minimum similarity score threshold (0-1)"
				error={errors.minScore?.message}
			>
				<Input
					{...register("minScore", { valueAsNumber: true })}
					type="number"
					step="0.01"
					placeholder="0.7"
				/>
			</FormField>
		</div>
	);
}
