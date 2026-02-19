"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { FormField } from "@/shared/ui/form-field";
import { EmptyState } from "@/shared/ui/empty-state";
import { useUpdatePluginConfig } from "../api/use-plugin-detail";

interface PluginSettingsFormProps {
	pluginId: string;
	config: Record<string, unknown> | null;
	configSchema: Record<string, unknown> | null;
}

/** Determine field type from schema entry */
function getFieldType(schema: Record<string, unknown>): "string" | "number" | "boolean" {
	const type = schema.type as string | undefined;
	if (type === "boolean") return "boolean";
	if (type === "number") return "number";
	return "string";
}

export function PluginSettingsForm({
	pluginId,
	config,
	configSchema,
}: PluginSettingsFormProps) {
	const updateConfig = useUpdatePluginConfig(pluginId);
	const [formValues, setFormValues] = useState<Record<string, unknown>>({});

	// Initialize form values from config
	useEffect(() => {
		if (config) {
			setFormValues({ ...config });
		}
	}, [config]);

	if (!configSchema || Object.keys(configSchema).length === 0) {
		return (
			<EmptyState
				title="No configuration options"
				description="This plugin does not have any configurable settings."
			/>
		);
	}

	const handleSave = () => {
		updateConfig.mutate(formValues);
	};

	const updateField = (key: string, value: unknown) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="space-y-6">
			{Object.entries(configSchema).map(([key, schemaDef]) => {
				const schema = schemaDef as Record<string, unknown>;
				const fieldType = getFieldType(schema);
				const label = (schema.label as string) ?? key;
				const required = (schema.required as boolean) ?? false;

				if (fieldType === "boolean") {
					return (
						<div key={key} className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-foreground">{label}</p>
							</div>
							<Switch
								checked={formValues[key] === true}
								onCheckedChange={(checked) => updateField(key, checked)}
							/>
						</div>
					);
				}

				return (
					<FormField key={key} label={label} required={required}>
						<Input
							type={fieldType === "number" ? "number" : "text"}
							value={String(formValues[key] ?? "")}
							onChange={(e) =>
								updateField(
									key,
									fieldType === "number"
										? Number(e.target.value)
										: e.target.value,
								)
							}
						/>
					</FormField>
				);
			})}

			<Button
				onClick={handleSave}
				disabled={updateConfig.isPending}
				size="sm"
			>
				<Save className="size-4" />
				{updateConfig.isPending ? "Saving..." : "Save Settings"}
			</Button>
		</div>
	);
}
