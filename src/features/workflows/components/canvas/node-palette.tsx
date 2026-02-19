"use client";

/**
 * Node palette sidebar for the workflow editor.
 *
 * Groups all 12 node types by category with draggable items.
 * Users drag nodes from this palette onto the canvas.
 */

import { useMemo, type DragEvent } from "react";
import {
	Zap,
	Bot,
	GitBranch,
	Clock,
	Shuffle,
	Send,
	Repeat,
	GitFork,
	Globe,
	Code,
	ShieldCheck,
	Workflow,
} from "lucide-react";
import { NODE_REGISTRY, NODE_CATEGORIES } from "@/entities/workflow";
import { cn } from "@/shared/lib/cn";

// ---------------------------------------------------------------------------
// Icon lookup
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, typeof Zap> = {
	Zap,
	Bot,
	GitBranch,
	Clock,
	Shuffle,
	Send,
	Repeat,
	GitFork,
	Globe,
	Code,
	ShieldCheck,
	Workflow,
};

// ---------------------------------------------------------------------------
// Category display names
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
	trigger: "Triggers",
	action: "Actions",
	control: "Control Flow",
	io: "Input / Output",
	special: "Special",
	code: "Code",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NodePalette() {
	// Group nodes by category
	const groupedNodes = useMemo(() => {
		const groups: Record<string, typeof NODE_REGISTRY> = {};

		for (const entry of NODE_REGISTRY) {
			const cat = entry.category;
			if (!groups[cat]) {
				groups[cat] = [];
			}
			groups[cat].push(entry);
		}

		return groups;
	}, []);

	const onDragStart = (event: DragEvent, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="flex h-full w-64 flex-col border-r bg-background">
			<div className="border-b px-4 py-3">
				<h3 className="text-sm font-semibold text-foreground">Nodes</h3>
				<p className="text-xs text-muted-foreground mt-0.5">
					Drag nodes onto canvas
				</p>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-5">
				{Object.entries(groupedNodes).map(([category, entries]) => {
					const colors = NODE_CATEGORIES[category];
					return (
						<div key={category}>
							{/* Category heading */}
							<div className="flex items-center gap-2 mb-2">
								<span
									className={cn(
										"inline-block size-2 rounded-full",
										colors?.bg?.replace("/10", ""),
									)}
									style={{
										backgroundColor: colors
											? undefined
											: "hsl(var(--muted-foreground))",
									}}
								/>
								<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{CATEGORY_LABELS[category] ?? category}
								</span>
							</div>

							{/* Draggable node items */}
							<div className="space-y-1.5">
								{entries.map((entry) => {
									const Icon = ICON_MAP[entry.icon] ?? Zap;
									return (
										<div
											key={entry.type}
											draggable
											onDragStart={(e) =>
												onDragStart(e, entry.type)
											}
											className="flex items-center gap-2 rounded-md border p-2 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors"
										>
											<Icon
												className={cn(
													"size-4 shrink-0",
													colors?.text ??
														"text-muted-foreground",
												)}
											/>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-foreground leading-none">
													{entry.label}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5 truncate">
													{entry.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
