"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GatewayServerConfig } from "@/entities/gateway-config";
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
import { gatewayConfigSchema } from "../schemas/config-schemas";

interface ConfigSectionGatewayProps {
	values: GatewayServerConfig;
	onUpdate: (values: GatewayServerConfig) => void;
}

export function ConfigSectionGateway({
	values,
	onUpdate,
}: ConfigSectionGatewayProps) {
	const {
		register,
		watch,
		control,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(gatewayConfigSchema as never),
		defaultValues: {
			port: values.port,
			dataDir: values.dataDir,
			logLevel: values.logLevel,
			corsEnabled: values.cors.enabled,
		},
	});

	useEffect(() => {
		const subscription = watch((formValues) => {
			const timer = setTimeout(() => {
				onUpdate({
					port: Number(formValues.port ?? values.port),
					dataDir: (formValues.dataDir as string) ?? values.dataDir,
					logLevel: (formValues.logLevel ?? values.logLevel) as GatewayServerConfig["logLevel"],
					cors: {
						enabled: (formValues.corsEnabled ?? values.cors.enabled) as boolean,
						origins: values.cors.origins,
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
				label="Port"
				description="Port the gateway server listens on"
				error={errors.port?.message}
				required
			>
				<Input
					{...register("port", { valueAsNumber: true })}
					type="number"
					placeholder="8080"
				/>
			</FormField>

			<FormField
				label="Data Directory"
				description="Path for persistent gateway data storage"
				error={errors.dataDir?.message}
				required
			>
				<Input {...register("dataDir")} placeholder="./data" />
			</FormField>

			<FormField
				label="Log Level"
				description="Gateway logging verbosity"
				error={errors.logLevel?.message}
			>
				<Controller
					control={control}
					name="logLevel"
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select log level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="debug">Debug</SelectItem>
								<SelectItem value="info">Info</SelectItem>
								<SelectItem value="warn">Warn</SelectItem>
								<SelectItem value="error">Error</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			<div className="flex items-center gap-3">
				<Controller
					control={control}
					name="corsEnabled"
					render={({ field }) => (
						<Switch
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<Label>Enable CORS</Label>
			</div>
		</div>
	);
}
