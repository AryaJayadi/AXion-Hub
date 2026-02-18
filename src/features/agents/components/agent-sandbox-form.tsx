"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sandboxConfigSchema, type SandboxConfig } from "../schemas/config-schemas";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { FormField } from "@/shared/ui/form-field";
import { toast } from "sonner";

interface AgentSandboxFormProps {
	agentId: string;
}

export function AgentSandboxForm({ agentId }: AgentSandboxFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SandboxConfig>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type divergence with exactOptionalPropertyTypes
		resolver: zodResolver(sandboxConfigSchema) as any,
		defaultValues: {
			enabled: false,
			image: "node:20-slim",
			workspacePath: "/workspace",
		},
	});

	const sandboxEnabled = watch("enabled");

	async function onSubmit(_data: SandboxConfig) {
		// TODO: Replace with gatewayClient.agent.updateSandbox(agentId, data)
		void agentId; // used once gateway is wired
		await new Promise((resolve) => setTimeout(resolve, 500));
		toast.success("Sandbox configuration saved");
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
			<div className="flex items-center justify-between rounded-lg border border-border p-4">
				<div className="space-y-0.5">
					<p className="text-sm font-medium">Sandbox Mode</p>
					<p className="text-xs text-muted-foreground">
						Run agent in an isolated Docker container
					</p>
				</div>
				<Switch
					checked={sandboxEnabled}
					onCheckedChange={(checked) => setValue("enabled", checked)}
					aria-label="Toggle sandbox mode"
				/>
			</div>

			<FormField label="Docker Image" description="Container image for the sandbox environment" error={errors.image?.message}>
				<Input placeholder="node:20-slim" {...register("image")} disabled={!sandboxEnabled} />
			</FormField>

			<FormField
				label="Workspace Path"
				description="Mount path for the agent workspace inside the container"
				error={errors.workspacePath?.message}
			>
				<Input placeholder="/workspace" {...register("workspacePath")} disabled={!sandboxEnabled} />
			</FormField>

			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Saving..." : "Save Configuration"}
			</Button>
		</form>
	);
}
