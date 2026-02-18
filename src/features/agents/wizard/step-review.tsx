"use client";

import { useWizardStore, DEFAULT_MODEL_CONFIG, DEFAULT_SANDBOX } from "../model/wizard-store";
import { useCreateAgent } from "../api/use-agent-mutations";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Loader2 } from "lucide-react";

interface StepReviewProps {
	onComplete: () => void;
}

function ReviewSection({
	title,
	children,
	skipped = false,
}: {
	title: string;
	children: React.ReactNode;
	skipped?: boolean;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<h3 className="text-sm font-semibold">{title}</h3>
				{skipped && (
					<Badge variant="secondary" className="text-xs">
						Using defaults
					</Badge>
				)}
			</div>
			<div className="rounded-lg border p-4 text-sm">{children}</div>
		</div>
	);
}

export function StepReview({ onComplete }: StepReviewProps) {
	const basics = useWizardStore((s) => s.basics);
	const modelConfig = useWizardStore((s) => s.modelConfig);
	const identity = useWizardStore((s) => s.identity);
	const skillsTools = useWizardStore((s) => s.skillsTools);
	const sandbox = useWizardStore((s) => s.sandbox);
	const channels = useWizardStore((s) => s.channels);
	const reset = useWizardStore((s) => s.reset);

	const createAgent = useCreateAgent();

	async function handleCreate() {
		if (!basics?.name) return;

		const model = modelConfig?.model ?? DEFAULT_MODEL_CONFIG.model;

		await createAgent.mutateAsync({
			name: basics.name,
			description: basics.description ?? "",
			model,
		});

		reset();
		onComplete();
	}

	const effectiveModel = modelConfig ?? DEFAULT_MODEL_CONFIG;
	const effectiveSandbox = sandbox ?? DEFAULT_SANDBOX;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Review & Create</h2>
				<p className="text-sm text-muted-foreground">
					Review your agent configuration before creating it. You can go back to
					any step to make changes.
				</p>
			</div>

			{/* Basics */}
			<ReviewSection title="Basics" skipped={!basics}>
				{basics ? (
					<div className="space-y-1">
						<div>
							<span className="text-muted-foreground">Name: </span>
							<span className="font-medium">{basics.name}</span>
						</div>
						{basics.description && (
							<div>
								<span className="text-muted-foreground">Description: </span>
								{basics.description}
							</div>
						)}
						{basics.avatar && (
							<div>
								<span className="text-muted-foreground">Avatar: </span>
								<span className="text-xs break-all">{basics.avatar}</span>
							</div>
						)}
					</div>
				) : (
					<p className="text-muted-foreground">Not configured</p>
				)}
			</ReviewSection>

			<Separator />

			{/* Model Config */}
			<ReviewSection title="Model Configuration" skipped={!modelConfig}>
				<div className="space-y-1">
					<div>
						<span className="text-muted-foreground">Model: </span>
						<span className="font-medium">{effectiveModel.model}</span>
					</div>
					<div>
						<span className="text-muted-foreground">Temperature: </span>
						{effectiveModel.temperature}
					</div>
					<div>
						<span className="text-muted-foreground">Max Tokens: </span>
						{effectiveModel.maxTokens.toLocaleString()}
					</div>
				</div>
			</ReviewSection>

			<Separator />

			{/* Identity */}
			<ReviewSection title="Identity Files" skipped={!identity}>
				{identity ? (
					<div className="space-y-1">
						{(["soul", "identity", "user", "agents"] as const).map((key) => (
							<div key={key}>
								<span className="text-muted-foreground font-mono text-xs">
									{key.toUpperCase()}.md:{" "}
								</span>
								<span className="text-xs">
									{identity[key]
										? `${identity[key].split("\n").length} lines`
										: "Empty"}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">Using starter templates</p>
				)}
			</ReviewSection>

			<Separator />

			{/* Skills & Tools */}
			<ReviewSection title="Skills & Tools" skipped={!skillsTools}>
				{skillsTools ? (
					<div className="space-y-2">
						<div>
							<span className="text-muted-foreground">Skills: </span>
							{skillsTools.skills.length > 0 ? (
								<span className="inline-flex flex-wrap gap-1">
									{skillsTools.skills.map((s) => (
										<Badge key={s} variant="secondary" className="text-xs">
											{s}
										</Badge>
									))}
								</span>
							) : (
								<span className="text-muted-foreground">None</span>
							)}
						</div>
						<div>
							<span className="text-muted-foreground">Allowed Tools: </span>
							{skillsTools.tools.length > 0 ? (
								<span className="inline-flex flex-wrap gap-1">
									{skillsTools.tools.map((t) => (
										<Badge key={t} variant="outline" className="text-xs">
											{t}
										</Badge>
									))}
								</span>
							) : (
								<span className="text-muted-foreground">None</span>
							)}
						</div>
						{skillsTools.deniedTools.length > 0 && (
							<div>
								<span className="text-muted-foreground">Denied Tools: </span>
								<span className="inline-flex flex-wrap gap-1">
									{skillsTools.deniedTools.map((t) => (
										<Badge
											key={t}
											variant="destructive"
											className="text-xs"
										>
											{t}
										</Badge>
									))}
								</span>
							</div>
						)}
					</div>
				) : (
					<p className="text-muted-foreground">No skills or tools configured</p>
				)}
			</ReviewSection>

			<Separator />

			{/* Sandbox */}
			<ReviewSection title="Sandbox" skipped={!sandbox}>
				<div className="space-y-1">
					<div>
						<span className="text-muted-foreground">Enabled: </span>
						<span className="font-medium">
							{effectiveSandbox.enabled ? "Yes" : "No"}
						</span>
					</div>
					{effectiveSandbox.enabled && (
						<>
							<div>
								<span className="text-muted-foreground">Image: </span>
								<span className="font-mono text-xs">
									{effectiveSandbox.image}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground">Workspace: </span>
								<span className="font-mono text-xs">
									{effectiveSandbox.workspacePath}
								</span>
							</div>
						</>
					)}
				</div>
			</ReviewSection>

			<Separator />

			{/* Channels */}
			<ReviewSection title="Channel Routing" skipped={!channels}>
				{channels && channels.bindings.length > 0 ? (
					<div className="space-y-1">
						{channels.bindings.map((binding, i) => (
							<div key={i}>
								<span className="font-mono text-xs">
									{binding.channelId}
								</span>
								<span className="text-muted-foreground"> -- </span>
								<span className="text-xs">{binding.rule}</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">No channel bindings configured</p>
				)}
			</ReviewSection>

			{/* Create Button */}
			<div className="flex justify-end border-t pt-6">
				<Button
					size="lg"
					onClick={handleCreate}
					disabled={!basics?.name || createAgent.isPending}
				>
					{createAgent.isPending && (
						<Loader2 className="size-4 animate-spin" />
					)}
					Create Agent
				</Button>
			</div>
		</div>
	);
}
