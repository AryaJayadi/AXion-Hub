"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicsSchema, type BasicsFormValues } from "../schemas/wizard-schemas";
import { useWizardStore } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";

interface StepBasicsProps {
	onNext: () => void;
}

export function StepBasics({ onNext }: StepBasicsProps) {
	const basics = useWizardStore((s) => s.basics);
	const setBasics = useWizardStore((s) => s.setBasics);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<BasicsFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
		resolver: zodResolver(basicsSchema) as any,
		defaultValues: {
			name: basics?.name ?? "",
			description: basics?.description ?? "",
			avatar: basics?.avatar ?? undefined,
		},
	});

	function onSubmit(data: BasicsFormValues) {
		setBasics(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Agent Basics</h2>
				<p className="text-sm text-muted-foreground">
					Give your agent a name and description. Name is required.
				</p>
			</div>

			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor="agent-name">
					Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id="agent-name"
					placeholder="e.g. Code Assistant"
					{...register("name")}
					aria-invalid={!!errors.name}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name.message}</p>
				)}
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="agent-description">Description</Label>
				<Textarea
					id="agent-description"
					placeholder="Describe what this agent does..."
					rows={3}
					{...register("description")}
					aria-invalid={!!errors.description}
				/>
				{errors.description && (
					<p className="text-xs text-destructive">{errors.description.message}</p>
				)}
			</div>

			{/* Avatar URL */}
			<div className="space-y-2">
				<Label htmlFor="agent-avatar">Avatar URL</Label>
				<Input
					id="agent-avatar"
					placeholder="https://example.com/avatar.png"
					{...register("avatar")}
					aria-invalid={!!errors.avatar}
				/>
				{errors.avatar && (
					<p className="text-xs text-destructive">{errors.avatar.message}</p>
				)}
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
