"use client";

/**
 * Shared base node component for all workflow node types.
 *
 * Renders a card with category-specific border color, icon header,
 * target/source handles, and a children slot for node-specific content.
 */

import { memo, type ReactNode } from "react";
import { Handle, Position } from "@xyflow/react";
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
import type { WorkflowNodeType } from "@/entities/workflow";
import { getNodeCategory, getNodeRegistryEntry } from "@/entities/workflow";
import { cn } from "@/shared/lib/cn";

// ---------------------------------------------------------------------------
// Icon lookup (lucide icon name string -> component)
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
// Component
// ---------------------------------------------------------------------------

interface BaseWorkflowNodeProps {
	id: string;
	data: Record<string, unknown>;
	selected?: boolean;
	nodeType: WorkflowNodeType;
	/** Slot for node-specific content below the header */
	children?: ReactNode;
	/** If true, do NOT render the default source handle (node renders its own) */
	customSourceHandles?: boolean;
	/** If true, do NOT render the target handle (e.g. trigger nodes) */
	noTargetHandle?: boolean;
}

function BaseWorkflowNodeInner({
	data,
	selected,
	nodeType,
	children,
	customSourceHandles,
	noTargetHandle,
}: BaseWorkflowNodeProps) {
	const category = getNodeCategory(nodeType);
	const entry = getNodeRegistryEntry(nodeType);
	const IconComponent = entry ? ICON_MAP[entry.icon] : Zap;
	const Icon = IconComponent ?? Zap;
	const label = (data.label as string) ?? entry?.label ?? nodeType;

	return (
		<>
			{/* Target handle (input) -- hidden for trigger nodes */}
			{!noTargetHandle && (
				<Handle
					type="target"
					position={Position.Top}
					className="!bg-muted-foreground"
				/>
			)}

			{/* Card */}
			<div
				className={cn(
					"w-[200px] rounded-lg border-2 bg-card p-3 shadow-sm",
					category.border,
					selected && "ring-2 ring-primary/20",
				)}
			>
				{/* Header */}
				<div className="flex items-center gap-2">
					<Icon className={cn("size-4 shrink-0", category.text)} />
					<span className="truncate text-sm font-semibold text-foreground">
						{label}
					</span>
				</div>

				{/* Node-specific content */}
				{children && <div className="mt-2">{children}</div>}
			</div>

			{/* Default source handle (output) */}
			{!customSourceHandles && (
				<Handle
					type="source"
					position={Position.Bottom}
					className="!bg-muted-foreground"
				/>
			)}
		</>
	);
}

export const BaseWorkflowNode = memo(BaseWorkflowNodeInner);
