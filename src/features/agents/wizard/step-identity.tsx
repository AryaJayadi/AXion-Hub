"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema, type IdentityFormValues } from "../schemas/wizard-schemas";
import { useWizardStore, DEFAULT_IDENTITY } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";

const IDENTITY_FILES = [
	{
		key: "soul" as const,
		name: "SOUL.md",
		description: "Core personality and values",
	},
	{
		key: "identity" as const,
		name: "IDENTITY.md",
		description: "Role and capabilities",
	},
	{
		key: "user" as const,
		name: "USER.md",
		description: "User preferences and context",
	},
	{
		key: "agents" as const,
		name: "AGENTS.md",
		description: "Known agents and relationships",
	},
];

interface StepIdentityProps {
	onNext: () => void;
}

export function StepIdentity({ onNext }: StepIdentityProps) {
	const identity = useWizardStore((s) => s.identity);
	const setIdentity = useWizardStore((s) => s.setIdentity);

	const { register, handleSubmit } = useForm<IdentityFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
		resolver: zodResolver(identitySchema) as any,
		defaultValues: {
			soul: identity?.soul ?? DEFAULT_IDENTITY.soul,
			identity: identity?.identity ?? DEFAULT_IDENTITY.identity,
			user: identity?.user ?? DEFAULT_IDENTITY.user,
			agents: identity?.agents ?? DEFAULT_IDENTITY.agents,
		},
	});

	function onSubmit(data: IdentityFormValues) {
		setIdentity(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Identity Files</h2>
				<p className="text-sm text-muted-foreground">
					Define your agent's personality, role, and context. These markdown files
					shape how the agent thinks and communicates.
				</p>
			</div>

			<div className="space-y-6">
				{IDENTITY_FILES.map((file) => (
					<div key={file.key} className="space-y-2">
						<Label htmlFor={`identity-${file.key}`}>
							<span className="font-mono text-xs">{file.name}</span>
							<span className="ml-2 text-muted-foreground font-normal">
								-- {file.description}
							</span>
						</Label>
						<Textarea
							id={`identity-${file.key}`}
							rows={8}
							className="font-mono text-sm"
							{...register(file.key)}
						/>
					</div>
				))}
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
