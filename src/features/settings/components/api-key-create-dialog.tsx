"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
	AlertTriangle,
	Check,
	Copy,
	Key,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useCreateApiKey } from "../api/use-api-keys";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createKeySchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	expiration: z.enum(["never", "30d", "60d", "90d", "1y"]),
});

type CreateKeyFormValues = z.infer<typeof createKeySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXPIRATION_OPTIONS = [
	{ value: "never", label: "Never" },
	{ value: "30d", label: "30 days" },
	{ value: "60d", label: "60 days" },
	{ value: "90d", label: "90 days" },
	{ value: "1y", label: "1 year" },
] as const;

function expirationToSeconds(value: string): number | null {
	switch (value) {
		case "30d":
			return 30 * 24 * 60 * 60;
		case "60d":
			return 60 * 24 * 60 * 60;
		case "90d":
			return 90 * 24 * 60 * 60;
		case "1y":
			return 365 * 24 * 60 * 60;
		default:
			return null;
	}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ApiKeyCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ApiKeyCreateDialog({
	open,
	onOpenChange,
}: ApiKeyCreateDialogProps) {
	const createApiKey = useCreateApiKey();
	const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [selectedExpiration, setSelectedExpiration] = useState("never");

	const form = useForm<CreateKeyFormValues>({
		resolver: zodResolver(createKeySchema) as never,
		defaultValues: {
			name: "",
			expiration: "never",
		},
	});

	function onSubmit(values: CreateKeyFormValues) {
		const expiresIn = expirationToSeconds(values.expiration);

		createApiKey.mutate(
			{
				name: values.name,
				...(expiresIn !== null ? { expiresIn } : {}),
			},
			{
				onSuccess: (data) => {
					setJustCreatedKey(data.key);
					toast.success("API key created");
				},
			},
		);
	}

	function handleCopy() {
		if (justCreatedKey) {
			navigator.clipboard.writeText(justCreatedKey);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		}
	}

	function handleClose() {
		setJustCreatedKey(null);
		setCopied(false);
		setSelectedExpiration("never");
		form.reset();
		onOpenChange(false);
	}

	const isRevealPhase = justCreatedKey !== null;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent showCloseButton={!isRevealPhase}>
				<DialogHeader>
					<DialogTitle>
						{isRevealPhase ? "API Key Created" : "Create API Key"}
					</DialogTitle>
					<DialogDescription>
						{isRevealPhase
							? "Copy your new API key now. You will not be able to see it again."
							: "Create a new API key for external integrations."}
					</DialogDescription>
				</DialogHeader>

				{isRevealPhase ? (
					/* Phase 2: Reveal key */
					<div className="space-y-4">
						<div className="relative rounded-lg border bg-muted p-4">
							<code className="text-sm font-mono break-all select-all">
								{justCreatedKey}
							</code>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2"
								onClick={handleCopy}
							>
								{copied ? (
									<Check className="size-4 text-green-500" />
								) : (
									<Copy className="size-4" />
								)}
							</Button>
						</div>
						<div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
							<AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
							<p className="text-sm text-amber-700 dark:text-amber-400">
								This key won&apos;t be shown again. Copy it now and
								store it securely.
							</p>
						</div>
						<DialogFooter>
							<Button onClick={handleClose}>Done</Button>
						</DialogFooter>
					</div>
				) : (
					/* Phase 1: Create form */
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							label="Key Name"
							error={form.formState.errors.name?.message}
							required
						>
							<div className="relative">
								<Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									{...form.register("name")}
									placeholder="e.g., CI/CD Pipeline"
									className="pl-9"
								/>
							</div>
						</FormField>
						<FormField label="Expiration">
							<Select
								value={selectedExpiration}
								onValueChange={(value) => {
									setSelectedExpiration(value);
									form.setValue(
										"expiration",
										value as CreateKeyFormValues["expiration"],
									);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{EXPIRATION_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
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
								disabled={createApiKey.isPending}
							>
								{createApiKey.isPending && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Create Key
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
