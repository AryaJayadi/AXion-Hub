"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ModelsConfig } from "@/entities/gateway-config";
import { Badge } from "@/shared/ui/badge";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { modelsConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionModelsProps {
	values: ModelsConfig;
	onUpdate: (values: ModelsConfig) => void;
}

export function ConfigSectionModels({
	values,
	onUpdate,
}: ConfigSectionModelsProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<ModelsConfig>({
		resolver: zodResolver(modelsConfigSchema as never),
		defaultValues: values,
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate({
					...values,
					defaultModel: formValues.defaultModel ?? values.defaultModel,
					maxRetries: Number(formValues.maxRetries ?? values.maxRetries),
				});
			}, 300);
			return () => clearTimeout(timer);
		});
		return () => subscription.unsubscribe();
	}, [watch, onUpdate, values]);

	const providerEntries = Object.entries(values.providers);

	return (
		<div className="space-y-6">
			<FormField
				label="Default Model"
				description="The model used when no specific model is requested"
				error={errors.defaultModel?.message}
				required
			>
				<Input {...register("defaultModel")} placeholder="claude-sonnet-4" />
			</FormField>

			<FormField
				label="Max Retries"
				description="Number of retry attempts on model API failure"
				error={errors.maxRetries?.message}
			>
				<Input
					{...register("maxRetries", { valueAsNumber: true })}
					type="number"
					placeholder="3"
				/>
			</FormField>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h4 className="text-sm font-medium">Configured Providers</h4>
					<p className="text-xs text-muted-foreground">
						Configure providers at{" "}
						<a
							href="/models"
							className="text-primary underline underline-offset-4 hover:text-primary/80"
						>
							/models
						</a>
					</p>
				</div>
				{providerEntries.length === 0 ? (
					<p className="text-sm text-muted-foreground italic">
						No providers configured
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{providerEntries.map(([name]) => (
							<Badge key={name} variant="outline">
								{name}
							</Badge>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
