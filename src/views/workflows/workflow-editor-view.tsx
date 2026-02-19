"use client";

/**
 * Workflow editor composition view at /workflows/new.
 *
 * Three-column layout: NodePalette (left) | WorkflowCanvas (center) | NodeConfigPanel (right).
 * Wrapped in ReactFlowProvider (MUST be ancestor of canvas, per research Pitfall 2).
 */

import { ReactFlowProvider } from "@xyflow/react";
import { Undo2, Redo2, Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { WorkflowCanvas } from "@/features/workflows/components/canvas/workflow-canvas";
import { NodePalette } from "@/features/workflows/components/canvas/node-palette";
import { NodeConfigPanel } from "@/features/workflows/components/canvas/node-config-panel";
import { useWorkflowCanvasStore } from "@/features/workflows/model/workflow-canvas-store";

// ---------------------------------------------------------------------------
// Inner component (needs ReactFlowProvider ancestor)
// ---------------------------------------------------------------------------

function WorkflowEditorInner() {
	const workflowName = useWorkflowCanvasStore((s) => s.workflowName);
	const isDirty = useWorkflowCanvasStore((s) => s.isDirty);
	const past = useWorkflowCanvasStore((s) => s.past);
	const future = useWorkflowCanvasStore((s) => s.future);
	const undo = useWorkflowCanvasStore((s) => s.undo);
	const redo = useWorkflowCanvasStore((s) => s.redo);

	// Update workflow name directly in store
	const setName = (name: string) => {
		useWorkflowCanvasStore.setState({ workflowName: name, isDirty: true });
	};

	return (
		<div className="flex h-[calc(100vh-64px)] flex-col">
			{/* Top bar */}
			<div className="flex items-center gap-2 border-b px-4 py-2">
				<Input
					value={workflowName}
					onChange={(e) => setName(e.target.value)}
					className="h-8 max-w-xs border-none bg-transparent text-sm font-semibold shadow-none focus-visible:ring-1"
					placeholder="Workflow name"
				/>

				<div className="ml-auto flex items-center gap-1.5">
					{/* Undo */}
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={undo}
						disabled={past.length === 0}
						title="Undo"
					>
						<Undo2 className="size-4" />
						<span className="sr-only">Undo</span>
					</Button>

					{/* Redo */}
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={redo}
						disabled={future.length === 0}
						title="Redo"
					>
						<Redo2 className="size-4" />
						<span className="sr-only">Redo</span>
					</Button>

					{/* Save */}
					<Button size="sm" disabled={!isDirty}>
						<Save className="mr-1.5 size-4" />
						Save
					</Button>
				</div>
			</div>

			{/* Three-column layout */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left: Node palette */}
				<NodePalette />

				{/* Center: Canvas */}
				<div className="flex-1">
					<WorkflowCanvas />
				</div>

				{/* Right: Config panel (conditional) */}
				<NodeConfigPanel />
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Exported view (wraps in ReactFlowProvider)
// ---------------------------------------------------------------------------

export function WorkflowEditorView() {
	return (
		<ReactFlowProvider>
			<WorkflowEditorInner />
		</ReactFlowProvider>
	);
}
