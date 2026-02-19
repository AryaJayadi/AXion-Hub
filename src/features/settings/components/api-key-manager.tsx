"use client";

import { useState } from "react";
import { Key, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useApiKeys, useDeleteApiKey } from "../api/use-api-keys";
import { ApiKeyCreateDialog } from "./api-key-create-dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

/**
 * Display API key as prefix + masked + last 4 chars.
 * e.g., "axion_****a1b2"
 */
function maskKey(prefix: string, start: string): string {
	return `${prefix}****${start}`;
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function SkeletonTable() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApiKeyManager() {
	const { data: keys, isLoading } = useApiKeys();
	const deleteApiKey = useDeleteApiKey();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [keyToDelete, setKeyToDelete] = useState<{
		id: string;
		name: string | null;
	} | null>(null);

	function handleDeleteConfirm() {
		if (keyToDelete) {
			deleteApiKey.mutate(keyToDelete.id);
			setKeyToDelete(null);
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="space-y-1.5">
						<CardTitle>API Keys</CardTitle>
						<CardDescription>
							Manage API keys for external integrations. Keys are
							shown once at creation.
						</CardDescription>
					</div>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="mr-2 size-4" />
						Create API Key
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<SkeletonTable />
				) : !keys || keys.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<Key className="size-6 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">No API keys yet</p>
							<p className="text-sm text-muted-foreground">
								Create one to integrate with external services.
							</p>
						</div>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Key</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead className="w-[80px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{keys.map((apiKey) => (
								<TableRow key={apiKey.id}>
									<TableCell className="font-medium">
										{apiKey.name ?? "Unnamed"}
									</TableCell>
									<TableCell>
										<code className="rounded bg-muted px-2 py-1 text-xs font-mono">
											{maskKey(apiKey.prefix, apiKey.start)}
										</code>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{formatDate(apiKey.createdAt)}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{apiKey.expiresAt
											? formatDate(apiKey.expiresAt)
											: "Never"}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive hover:text-destructive"
											onClick={() =>
												setKeyToDelete({
													id: apiKey.id,
													name: apiKey.name,
												})
											}
											disabled={deleteApiKey.isPending}
										>
											{deleteApiKey.isPending ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Trash2 className="size-4" />
											)}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>

			{/* Create dialog */}
			<ApiKeyCreateDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={keyToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setKeyToDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete API Key</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the API key{" "}
							<strong>{keyToDelete?.name ?? "Unnamed"}</strong>?
							This action cannot be undone. Any integrations using
							this key will stop working immediately.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleDeleteConfirm}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
