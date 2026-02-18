"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modelConfigSchema, type ModelConfigFormValues } from "../schemas/wizard-schemas";
import { useWizardStore, DEFAULT_MODEL_CONFIG } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

const AVAILABLE_MODELS = [
	{ value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
	{ value: "claude-haiku-4-20250414", label: "Claude Haiku 4" },
	{ value: "gpt-4o", label: "GPT-4o" },
	{ value: "gpt-4o-mini", label: "GPT-4o Mini" },
	{ value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
	{ value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
] as const;

interface StepModelConfigProps {
	onNext: () => void;
}

export function StepModelConfig({ onNext }: StepModelConfigProps) {
	const modelConfig = useWizardStore((s) => s.modelConfig);
	const setModelConfig = useWizardStore((s) => s.setModelConfig);

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<ModelConfigFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
		resolver: zodResolver(modelConfigSchema) as any,
		defaultValues: {
			model: modelConfig?.model ?? DEFAULT_MODEL_CONFIG.model,
			temperature: modelConfig?.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
			maxTokens: modelConfig?.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
		},
	});

	const temperatureValue = watch("temperature");

	function onSubmit(data: ModelConfigFormValues) {
		setModelConfig(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Model Configuration</h2>
				<p className="text-sm text-muted-foreground">
					Choose the AI model and configure generation parameters.
				</p>
			</div>

			{/* Model Select */}
			<div className="space-y-2">
				<Label>
					Model <span className="text-destructive">*</span>
				</Label>
				<Controller
					name="model"
					control={control}
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a model" />
							</SelectTrigger>
							<SelectContent>
								{AVAILABLE_MODELS.map((m) => (
									<SelectItem key={m.value} value={m.value}>
										{m.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.model && (
					<p className="text-xs text-destructive">{errors.model.message}</p>
				)}
			</div>

			{/* Temperature Slider */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Temperature</Label>
					<span className="text-sm font-mono text-muted-foreground">
						{temperatureValue.toFixed(1)}
					</span>
				</div>
				<Controller
					name="temperature"
					control={control}
					render={({ field }) => (
						<Slider
							min={0}
							max={2}
							step={0.1}
							value={[field.value]}
							onValueChange={([val]) => field.onChange(val)}
						/>
					)}
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>Precise (0)</span>
					<span>Creative (2)</span>
				</div>
			</div>

			{/* Max Tokens */}
			<div className="space-y-2">
				<Label htmlFor="max-tokens">Max Tokens</Label>
				<Input
					id="max-tokens"
					type="number"
					min={256}
					max={200000}
					{...register("maxTokens", { valueAsNumber: true })}
					aria-invalid={!!errors.maxTokens}
				/>
				{errors.maxTokens && (
					<p className="text-xs text-destructive">{errors.maxTokens.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					Range: 256 - 200,000 tokens
				</p>
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
