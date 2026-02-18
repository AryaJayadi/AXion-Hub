"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IdentityConfig } from "@/entities/gateway-config";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { identityConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionIdentityProps {
	values: IdentityConfig;
	onUpdate: (values: IdentityConfig) => void;
}

export function ConfigSectionIdentity({
	values,
	onUpdate,
}: ConfigSectionIdentityProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<IdentityConfig>({
		resolver: zodResolver(identityConfigSchema as never),
		defaultValues: values,
	});

	// Debounced sync back to store
	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate(formValues as IdentityConfig);
			}, 300);
			return () => clearTimeout(timer);
		});
		return () => subscription.unsubscribe();
	}, [watch, onUpdate]);

	return (
		<div className="space-y-6">
			<FormField
				label="Bot Name"
				description="The display name for your AI assistant"
				error={errors.botName?.message}
				required
			>
				<Input {...register("botName")} placeholder="AXion" />
			</FormField>

			<FormField
				label="Persona"
				description="System prompt defining the bot's personality and behavior"
				error={errors.persona?.message}
				required
			>
				<Textarea
					{...register("persona")}
					placeholder="You are a helpful AI assistant..."
					className="min-h-32"
				/>
			</FormField>

			<FormField
				label="Greeting"
				description="Initial message sent when a new session starts"
				error={errors.greeting?.message}
				required
			>
				<Textarea
					{...register("greeting")}
					placeholder="Hello! How can I help you today?"
				/>
			</FormField>
		</div>
	);
}
