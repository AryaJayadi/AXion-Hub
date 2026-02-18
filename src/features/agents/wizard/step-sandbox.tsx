"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sandboxSchema, type SandboxFormValues } from "../schemas/wizard-schemas";
import { useWizardStore, DEFAULT_SANDBOX } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

interface StepSandboxProps {
	onNext: () => void;
}

export function StepSandbox({ onNext }: StepSandboxProps) {
	const sandbox = useWizardStore((s) => s.sandbox);
	const setSandbox = useWizardStore((s) => s.setSandbox);

	const {
		register,
		handleSubmit,
		control,
		watch,
	} = useForm<SandboxFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
		resolver: zodResolver(sandboxSchema) as any,
		defaultValues: {
			enabled: sandbox?.enabled ?? DEFAULT_SANDBOX.enabled,
			image: sandbox?.image ?? DEFAULT_SANDBOX.image,
			workspacePath: sandbox?.workspacePath ?? DEFAULT_SANDBOX.workspacePath,
		},
	});

	const isEnabled = watch("enabled");

	function onSubmit(data: SandboxFormValues) {
		setSandbox(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Sandbox Configuration</h2>
				<p className="text-sm text-muted-foreground">
					Configure a sandboxed Docker environment for your agent to execute code
					safely.
				</p>
			</div>

			{/* Sandbox Toggle */}
			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label>Sandbox Mode</Label>
					<p className="text-xs text-muted-foreground">
						Run agent in an isolated Docker container
					</p>
				</div>
				<Controller
					name="enabled"
					control={control}
					render={({ field }) => (
						<Switch
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
			</div>

			{/* Docker Image */}
			<div className="space-y-2">
				<Label htmlFor="docker-image">Docker Image</Label>
				<Input
					id="docker-image"
					placeholder="node:20-slim"
					disabled={!isEnabled}
					{...register("image")}
				/>
				<p className="text-xs text-muted-foreground">
					The Docker image to use for the sandbox environment
				</p>
			</div>

			{/* Workspace Path */}
			<div className="space-y-2">
				<Label htmlFor="workspace-path">Workspace Path</Label>
				<Input
					id="workspace-path"
					placeholder="/workspace"
					disabled={!isEnabled}
					{...register("workspacePath")}
				/>
				<p className="text-xs text-muted-foreground">
					The working directory inside the sandbox container
				</p>
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
