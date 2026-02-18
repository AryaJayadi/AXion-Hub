"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CompactionConfig } from "@/entities/gateway-config";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { compactionConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionCompactionProps {
	values: CompactionConfig;
	onUpdate: (values: CompactionConfig) => void;
}

export function ConfigSectionCompaction({
	values,
	onUpdate,
}: ConfigSectionCompactionProps) {
	const {
		register,
		watch,
		control,
		formState: { errors },
	} = useForm<CompactionConfig>({
		resolver: zodResolver(compactionConfigSchema as never),
		defaultValues: values,
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate({
					enabled: formValues.enabled ?? values.enabled,
					strategy: formValues.strategy ?? values.strategy,
					threshold: Number(formValues.threshold ?? values.threshold),
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
				<Label>Enable Compaction</Label>
			</div>

			<FormField
				label="Strategy"
				description="How conversation history is compacted"
				error={errors.strategy?.message}
			>
				<Controller
					control={control}
					name="strategy"
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select strategy" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="summarize">Summarize</SelectItem>
								<SelectItem value="truncate">Truncate</SelectItem>
								<SelectItem value="sliding-window">Sliding Window</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			<FormField
				label="Threshold"
				description="Token count that triggers compaction"
				error={errors.threshold?.message}
			>
				<Input
					{...register("threshold", { valueAsNumber: true })}
					type="number"
					placeholder="80000"
				/>
			</FormField>
		</div>
	);
}
