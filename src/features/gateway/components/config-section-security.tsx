"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SecurityConfig } from "@/entities/gateway-config";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { securityConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionSecurityProps {
	values: SecurityConfig;
	onUpdate: (values: SecurityConfig) => void;
}

export function ConfigSectionSecurity({
	values,
	onUpdate,
}: ConfigSectionSecurityProps) {
	const {
		register,
		watch,
		control,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(securityConfigSchema as never),
		defaultValues: {
			authMode: values.authMode,
			allowedOrigins: values.allowedOrigins.join("\n"),
			rateLimitingWindowMs: values.rateLimiting.windowMs,
			rateLimitingMaxRequests: values.rateLimiting.maxRequests,
		},
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				const origins = (formValues.allowedOrigins as string ?? "")
					.split("\n")
					.map((o: string) => o.trim())
					.filter(Boolean);
				onUpdate({
					authMode: (formValues.authMode ?? values.authMode) as SecurityConfig["authMode"],
					allowedOrigins: origins,
					rateLimiting: {
						enabled: values.rateLimiting.enabled,
						windowMs: Number(formValues.rateLimitingWindowMs ?? values.rateLimiting.windowMs),
						maxRequests: Number(formValues.rateLimitingMaxRequests ?? values.rateLimiting.maxRequests),
					},
				});
			}, 300);
			return () => clearTimeout(timer);
		});
		return () => subscription.unsubscribe();
	}, [watch, onUpdate, values]);

	return (
		<div className="space-y-6">
			<FormField
				label="Auth Mode"
				description="Authentication method for gateway access"
			>
				<Controller
					control={control}
					name="authMode"
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select auth mode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								<SelectItem value="token">Token</SelectItem>
								<SelectItem value="oauth">OAuth</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			<FormField
				label="Allowed Origins"
				description="One origin per line (use * to allow all)"
				error={errors.allowedOrigins?.message as string | undefined}
			>
				<Textarea
					{...register("allowedOrigins")}
					placeholder="*"
					className="font-mono text-sm"
				/>
			</FormField>

			<FormField
				label="Rate Limit Window (ms)"
				description="Time window for rate limiting in milliseconds"
			>
				<Input
					{...register("rateLimitingWindowMs", { valueAsNumber: true })}
					type="number"
					placeholder="60000"
				/>
			</FormField>

			<FormField
				label="Max Requests per Window"
				description="Maximum number of requests allowed per window"
			>
				<Input
					{...register("rateLimitingMaxRequests", { valueAsNumber: true })}
					type="number"
					placeholder="100"
				/>
			</FormField>
		</div>
	);
}
