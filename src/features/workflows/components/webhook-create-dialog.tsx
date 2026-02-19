"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy, AlertTriangle, Check } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import { useWorkflows } from "../api/use-workflows";
import { useCreateWebhook } from "../api/use-webhooks";
import type { WebhookEndpoint } from "../api/use-webhooks";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const webhookFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	workflowId: z.string().min(1, "Workflow is required"),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WebhookCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string, label: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(`${label} copied!`);
	} catch {
		toast.error("Failed to copy");
	}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WebhookCreateDialog({
	open,
	onOpenChange,
}: WebhookCreateDialogProps) {
	const { workflows } = useWorkflows();
	const createMutation = useCreateWebhook();
	const [createdWebhook, setCreatedWebhook] = useState<WebhookEndpoint | null>(
		null,
	);

	const form = useForm<WebhookFormValues>({
		resolver: zodResolver(webhookFormSchema) as never,
		defaultValues: {
			name: "",
			workflowId: "",
		},
	});

	const handleClose = useCallback(() => {
		setCreatedWebhook(null);
		form.reset();
		onOpenChange(false);
	}, [form, onOpenChange]);

	const onSubmit = useCallback(
		(values: WebhookFormValues) => {
			createMutation.mutate(values, {
				onSuccess: (webhook) => {
					setCreatedWebhook(webhook);
				},
			});
		},
		[createMutation],
	);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-lg">
				{createdWebhook ? (
					/* Success state -- show generated URL and secret */
					<>
						<DialogHeader>
							<DialogTitle>Webhook Created</DialogTitle>
							<DialogDescription>
								Your webhook endpoint has been created. Save the
								secret below -- it will not be shown again.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-2">
							{/* URL */}
							<div className="space-y-1.5">
								<Label className="text-xs font-medium text-muted-foreground">
									Webhook URL
								</Label>
								<div className="flex items-center gap-2">
									<code className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono break-all">
										{createdWebhook.url}
									</code>
									<Button
										variant="outline"
										size="icon"
										className="shrink-0"
										onClick={() =>
											void copyToClipboard(
												createdWebhook.url,
												"URL",
											)
										}
									>
										<Copy className="size-4" />
									</Button>
								</div>
							</div>

							{/* Secret */}
							<div className="space-y-1.5">
								<Label className="text-xs font-medium text-muted-foreground">
									Signing Secret
								</Label>
								<div className="flex items-center gap-2">
									<code className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono break-all">
										{createdWebhook.secret}
									</code>
									<Button
										variant="outline"
										size="icon"
										className="shrink-0"
										onClick={() =>
											void copyToClipboard(
												createdWebhook.secret,
												"Secret",
											)
										}
									>
										<Copy className="size-4" />
									</Button>
								</div>
								<div className="flex items-center gap-1.5 text-xs text-warning">
									<AlertTriangle className="size-3.5" />
									<span>
										Save this secret -- it will not be shown
										again
									</span>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleClose}>
								<Check className="mr-2 size-4" />
								Done
							</Button>
						</DialogFooter>
					</>
				) : (
					/* Form state */
					<>
						<DialogHeader>
							<DialogTitle>Create Webhook</DialogTitle>
							<DialogDescription>
								Create an inbound webhook URL that triggers a
								workflow execution.
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 py-2"
						>
							{/* Name */}
							<div className="space-y-1.5">
								<Label htmlFor="webhook-name">Name</Label>
								<Input
									id="webhook-name"
									placeholder="e.g. GitHub Push Handler"
									{...form.register("name")}
								/>
								{form.formState.errors.name && (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>

							{/* Workflow */}
							<div className="space-y-1.5">
								<Label>Workflow</Label>
								<Select
									value={form.watch("workflowId")}
									onValueChange={(v) =>
										form.setValue("workflowId", v, {
											shouldValidate: true,
										})
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a workflow" />
									</SelectTrigger>
									<SelectContent>
										{workflows.map((wf) => (
											<SelectItem
												key={wf.id}
												value={wf.id}
											>
												{wf.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{form.formState.errors.workflowId && (
									<p className="text-xs text-destructive">
										{
											form.formState.errors.workflowId
												.message
										}
									</p>
								)}
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={createMutation.isPending}
								>
									{createMutation.isPending
										? "Creating..."
										: "Create Webhook"}
								</Button>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
