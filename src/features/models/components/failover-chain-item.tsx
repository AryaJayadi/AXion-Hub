"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";

import type { FailoverModel } from "@/entities/model-provider/model/types";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface FailoverChainItemProps {
	model: FailoverModel;
	index: number;
	onUpdate: (id: string, updates: Partial<FailoverModel>) => void;
	onRemove: (id: string) => void;
	isOverlay?: boolean;
}

export function FailoverChainItem({
	model,
	index,
	onUpdate,
	onRemove,
	isOverlay = false,
}: FailoverChainItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editRetries, setEditRetries] = useState(model.maxRetries);
	const [editTimeout, setEditTimeout] = useState(model.timeoutMs);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: model.id, disabled: isOverlay });

	const style = isOverlay
		? undefined
		: {
				transform: CSS.Transform.toString(transform),
				transition: transition ?? undefined,
			};

	const handleSaveEdit = () => {
		onUpdate(model.id, {
			maxRetries: editRetries,
			timeoutMs: editTimeout,
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditRetries(model.maxRetries);
		setEditTimeout(model.timeoutMs);
		setIsEditing(false);
	};

	return (
		<div
			ref={isOverlay ? undefined : setNodeRef}
			style={style}
			className={cn(
				"flex items-center gap-3 rounded-lg border bg-card p-3",
				isOverlay && "rotate-1 scale-105 shadow-lg",
				isDragging && "opacity-50",
			)}
		>
			{/* Drag handle */}
			<div
				{...(isOverlay ? {} : attributes)}
				{...(isOverlay ? {} : listeners)}
				className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
			>
				<GripVertical className="size-4" />
			</div>

			{/* Priority number */}
			<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
				{index + 1}
			</div>

			{/* Model info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{model.modelName}</p>
				<p className="text-xs text-muted-foreground">{model.providerName}</p>
			</div>

			{/* Badges or edit fields */}
			{isEditing ? (
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<label className="text-[10px] text-muted-foreground">Retries</label>
						<Input
							type="number"
							min={0}
							max={10}
							value={editRetries}
							onChange={(e) => setEditRetries(Number(e.target.value))}
							className="h-7 w-16 text-xs"
						/>
					</div>
					<div className="flex items-center gap-1">
						<label className="text-[10px] text-muted-foreground">Timeout</label>
						<Input
							type="number"
							min={1000}
							max={120000}
							step={1000}
							value={editTimeout}
							onChange={(e) => setEditTimeout(Number(e.target.value))}
							className="h-7 w-20 text-xs"
						/>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={handleSaveEdit}
					>
						<Check className="size-3.5 text-green-500" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={handleCancelEdit}
					>
						<X className="size-3.5" />
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-[10px] px-1.5 py-0">
						{model.maxRetries} retries
					</Badge>
					<Badge variant="outline" className="text-[10px] px-1.5 py-0">
						{(model.timeoutMs / 1000).toFixed(0)}s timeout
					</Badge>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => setIsEditing(true)}
					>
						<Pencil className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-7 text-destructive hover:text-destructive"
						onClick={() => onRemove(model.id)}
					>
						<Trash2 className="size-3.5" />
					</Button>
				</div>
			)}
		</div>
	);
}
