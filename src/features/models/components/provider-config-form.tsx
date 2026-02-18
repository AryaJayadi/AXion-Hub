"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import type { ModelProvider } from "@/entities/model-provider/model/types";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import { useUpdateProvider, useTestConnection } from "../api/use-providers";
import {
	providerConfigSchema,
	type ProviderConfig,
} from "../schemas/model-schemas";

interface ProviderConfigFormProps {
	provider: ModelProvider;
}

export function ProviderConfigForm({ provider }: ProviderConfigFormProps) {
	const [showApiKey, setShowApiKey] = useState(false);
	const updateProvider = useUpdateProvider();
	const testConnection = useTestConnection(provider.slug);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProviderConfig>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 + exactOptionalPropertyTypes cast
		resolver: zodResolver(providerConfigSchema) as any,
		defaultValues: {
			apiKey: provider.authMethod !== "none" ? "sk-...XXXX" : "",
			baseUrl: provider.baseUrl ?? undefined,
			enabled: provider.status === "connected",
			maxConcurrentRequests: 10,
		},
	});

	const enabledValue = watch("enabled");

	const onSubmit = (data: ProviderConfig) => {
		updateProvider.mutate({
			slug: provider.slug,
			...(data.apiKey ? { apiKey: data.apiKey } : {}),
			...(data.baseUrl ? { baseUrl: data.baseUrl } : {}),
			...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
			...(data.maxConcurrentRequests !== undefined
				? { maxConcurrentRequests: data.maxConcurrentRequests }
				: {}),
		});
	};

	const handleTestConnection = () => {
		testConnection.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) {
					toast.success(`Connected (latency: ${result.latencyMs}ms)`);
				} else {
					toast.error(result.error ?? "Connection failed");
				}
			},
			onError: () => {
				toast.error("Connection test failed");
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* API Key */}
			<FormField
				label="API Key"
				error={errors.apiKey?.message}
				description={
					provider.authMethod === "none"
						? "No authentication required"
						: "Enter your provider API key"
				}
			>
				<div className="relative">
					<Input
						{...register("apiKey")}
						type={showApiKey ? "text" : "password"}
						disabled={provider.authMethod === "none"}
						placeholder={
							provider.authMethod === "none"
								? "No authentication required"
								: "Enter API key"
						}
						className="pr-10"
					/>
					{provider.authMethod !== "none" && (
						<button
							type="button"
							onClick={() => setShowApiKey(!showApiKey)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							{showApiKey ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					)}
				</div>
			</FormField>

			{/* Base URL (only for providers with a baseUrl or none auth like Ollama) */}
			{(provider.baseUrl || provider.authMethod === "none") && (
				<FormField
					label="Base URL"
					error={errors.baseUrl?.message}
					description="Custom endpoint URL for this provider"
				>
					<Input
						{...register("baseUrl")}
						type="url"
						placeholder="https://api.example.com"
					/>
				</FormField>
			)}

			{/* Max Concurrent Requests */}
			<FormField
				label="Max Concurrent Requests"
				error={errors.maxConcurrentRequests?.message}
				description="Maximum number of simultaneous API requests"
			>
				<Input
					{...register("maxConcurrentRequests", { valueAsNumber: true })}
					type="number"
					min={1}
					placeholder="10"
				/>
			</FormField>

			{/* Enabled toggle */}
			<FormField
				label="Enabled"
				description="Enable or disable this provider"
			>
				<Switch
					checked={enabledValue}
					onCheckedChange={(checked) => setValue("enabled", checked)}
				/>
			</FormField>

			{/* Action buttons */}
			<div className="flex items-center gap-3 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleTestConnection}
					disabled={testConnection.isPending}
				>
					{testConnection.isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Testing...
						</>
					) : testConnection.isSuccess ? (
						testConnection.data.success ? (
							<>
								<Check className="mr-2 size-4 text-green-500" />
								Test Connection
							</>
						) : (
							<>
								<X className="mr-2 size-4 text-destructive" />
								Test Connection
							</>
						)
					) : (
						"Test Connection"
					)}
				</Button>

				<Button type="submit" disabled={updateProvider.isPending}>
					{updateProvider.isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Configuration"
					)}
				</Button>
			</div>
		</form>
	);
}
