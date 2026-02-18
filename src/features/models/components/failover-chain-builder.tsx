"use client";

import { useState, useCallback, useMemo } from "react";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	KeyboardSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	Plus,
	Trash2,
	Save,
	Check,
	Pencil,
	X,
	AlertCircle,
} from "lucide-react";

import type {
	FailoverChain,
	FailoverModel,
} from "@/entities/model-provider/model/types";
import { cn } from "@/shared/lib/cn";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	useFailoverChains,
	useUpdateFailoverChain,
	useDeleteFailoverChain,
} from "../api/use-failover-chains";
import { useProviders } from "../api/use-providers";
import { FailoverChainItem } from "./failover-chain-item";

export function FailoverChainBuilder() {
	const { data: chains, isLoading } = useFailoverChains();
	const { data: providers } = useProviders();
	const updateChain = useUpdateFailoverChain();
	const deleteChain = useDeleteFailoverChain();

	const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
	const [localChains, setLocalChains] = useState<FailoverChain[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState(false);
	const [nameValue, setNameValue] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	// Sync chains from server
	const effectiveChains = useMemo(() => {
		if (localChains.length > 0) return localChains;
		return chains ?? [];
	}, [chains, localChains]);

	// Auto-select first chain
	const selectedChain = useMemo(() => {
		const id = selectedChainId ?? effectiveChains[0]?.id ?? null;
		return effectiveChains.find((c) => c.id === id) ?? null;
	}, [effectiveChains, selectedChainId]);

	// Initialize local chains from server data
	if (chains && localChains.length === 0 && chains.length > 0) {
		setLocalChains([...chains]);
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor),
	);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveId(null);
			const { active, over } = event;
			if (!over || !selectedChain) return;

			const oldIndex = selectedChain.models.findIndex(
				(m) => m.id === active.id,
			);
			const newIndex = selectedChain.models.findIndex(
				(m) => m.id === over.id,
			);

			if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
				setLocalChains((prev) =>
					prev.map((c) =>
						c.id === selectedChain.id
							? {
									...c,
									models: arrayMove(c.models, oldIndex, newIndex),
								}
							: c,
					),
				);
			}
		},
		[selectedChain],
	);

	const handleUpdateModel = useCallback(
		(modelId: string, updates: Partial<FailoverModel>) => {
			if (!selectedChain) return;
			setLocalChains((prev) =>
				prev.map((c) =>
					c.id === selectedChain.id
						? {
								...c,
								models: c.models.map((m) =>
									m.id === modelId ? { ...m, ...updates } : m,
								),
							}
						: c,
				),
			);
		},
		[selectedChain],
	);

	const handleRemoveModel = useCallback(
		(modelId: string) => {
			if (!selectedChain) return;
			setLocalChains((prev) =>
				prev.map((c) =>
					c.id === selectedChain.id
						? { ...c, models: c.models.filter((m) => m.id !== modelId) }
						: c,
				),
			);
		},
		[selectedChain],
	);

	const handleAddModel = useCallback(
		(
			providerId: string,
			providerName: string,
			modelId: string,
			modelName: string,
		) => {
			if (!selectedChain) return;
			setValidationError(null);

			const newModel: FailoverModel = {
				id: `fc-${Date.now()}`,
				providerId,
				modelId,
				modelName,
				providerName,
				maxRetries: 2,
				timeoutMs: 30000,
			};

			setLocalChains((prev) =>
				prev.map((c) =>
					c.id === selectedChain.id
						? { ...c, models: [...c.models, newModel] }
						: c,
				),
			);
		},
		[selectedChain],
	);

	const handleCreateChain = () => {
		const newChain: FailoverChain = {
			id: `chain-${Date.now()}`,
			name: "New Chain",
			models: [],
		};
		setLocalChains((prev) => [...prev, newChain]);
		setSelectedChainId(newChain.id);
		setEditingName(true);
		setNameValue("New Chain");
	};

	const handleSaveChain = () => {
		if (!selectedChain) return;
		if (selectedChain.models.length === 0) {
			setValidationError("Chain must have at least 1 model");
			return;
		}
		setValidationError(null);
		updateChain.mutate(selectedChain);
	};

	const handleDeleteChain = () => {
		if (!selectedChain) return;
		deleteChain.mutate(selectedChain.id);
		setLocalChains((prev) => prev.filter((c) => c.id !== selectedChain.id));
		setSelectedChainId(null);
	};

	const handleSaveName = () => {
		if (!selectedChain || !nameValue.trim()) return;
		setLocalChains((prev) =>
			prev.map((c) =>
				c.id === selectedChain.id ? { ...c, name: nameValue.trim() } : c,
			),
		);
		setEditingName(false);
	};

	const activeModel = selectedChain?.models.find((m) => m.id === activeId);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-40 w-full rounded-md bg-muted animate-pulse" />
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row gap-4">
			{/* Chain list sidebar */}
			<div className="w-full md:w-64 shrink-0 space-y-2">
				<h3 className="text-sm font-semibold mb-2">Chains</h3>
				{effectiveChains.map((chain) => (
					<button
						key={chain.id}
						type="button"
						onClick={() => setSelectedChainId(chain.id)}
						className={cn(
							"w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
							selectedChain?.id === chain.id
								? "border-primary bg-primary/5 font-medium"
								: "hover:bg-muted/50",
						)}
					>
						{chain.name}
						<span className="ml-2 text-xs text-muted-foreground">
							({chain.models.length} model{chain.models.length !== 1 ? "s" : ""})
						</span>
					</button>
				))}
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={handleCreateChain}
				>
					<Plus className="mr-1.5 size-3.5" />
					Create Chain
				</Button>
			</div>

			{/* Main chain editor */}
			{selectedChain ? (
				<Card className="flex-1">
					<CardHeader>
						<div className="flex items-center justify-between">
							{editingName ? (
								<div className="flex items-center gap-2">
									<Input
										value={nameValue}
										onChange={(e) => setNameValue(e.target.value)}
										className="h-8 w-48 text-sm"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveName();
											if (e.key === "Escape") setEditingName(false);
										}}
									/>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={handleSaveName}
									>
										<Check className="size-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() => setEditingName(false)}
									>
										<X className="size-3.5" />
									</Button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => {
										setNameValue(selectedChain.name);
										setEditingName(true);
									}}
									className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
								>
									{selectedChain.name}
									<Pencil className="size-3.5 text-muted-foreground" />
								</button>
							)}

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleSaveChain}
									disabled={updateChain.isPending}
								>
									<Save className="mr-1.5 size-3.5" />
									Save Chain
								</Button>

								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="mr-1.5 size-3.5" />
											Delete
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete failover chain?</AlertDialogTitle>
											<AlertDialogDescription>
												This will permanently delete &quot;{selectedChain.name}&quot;.
												This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDeleteChain}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</CardHeader>

					<CardContent className="space-y-3">
						{/* Validation error */}
						{validationError && (
							<div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
								<AlertCircle className="size-4 shrink-0" />
								{validationError}
							</div>
						)}

						{/* Sortable model list */}
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							modifiers={[restrictToVerticalAxis]}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={selectedChain.models.map((m) => m.id)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-2">
									{selectedChain.models.length > 0 ? (
										selectedChain.models.map((model, index) => (
											<FailoverChainItem
												key={model.id}
												model={model}
												index={index}
												onUpdate={handleUpdateModel}
												onRemove={handleRemoveModel}
											/>
										))
									) : (
										<div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
											No models in this chain. Add a model to get started.
										</div>
									)}
								</div>
							</SortableContext>

							<DragOverlay>
								{activeModel ? (
									<FailoverChainItem
										model={activeModel}
										index={selectedChain.models.findIndex(
											(m) => m.id === activeModel.id,
										)}
										onUpdate={() => {}}
										onRemove={() => {}}
										isOverlay
									/>
								) : null}
							</DragOverlay>
						</DndContext>

						{/* Add model button with popover */}
						<AddModelPopover
							providers={providers ?? []}
							onAdd={handleAddModel}
						/>
					</CardContent>
				</Card>
			) : (
				<Card className="flex-1">
					<CardContent className="flex items-center justify-center py-12">
						<p className="text-sm text-muted-foreground">
							Select a chain or create a new one
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

/** Popover to add a model to the chain, grouped by provider */
function AddModelPopover({
	providers,
	onAdd,
}: {
	providers: { id: string; name: string; models: { id: string; name: string }[] }[];
	onAdd: (
		providerId: string,
		providerName: string,
		modelId: string,
		modelName: string,
	) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					<Plus className="mr-1.5 size-3.5" />
					Add Model
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-0" align="start">
				<div className="max-h-64 overflow-y-auto p-2 space-y-2">
					{providers.map((provider) => (
						<div key={provider.id}>
							<p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
								{provider.name}
							</p>
							{provider.models.map((model) => (
								<button
									key={model.id}
									type="button"
									onClick={() => {
										onAdd(provider.id, provider.name, model.id, model.name);
										setOpen(false);
									}}
									className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
								>
									{model.name}
								</button>
							))}
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
