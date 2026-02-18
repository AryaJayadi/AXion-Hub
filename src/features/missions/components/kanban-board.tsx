"use client";

import { useState, useCallback } from "react";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	KeyboardSensor,
	closestCorners,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragOverEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { useBoardStore } from "../model/board-store";
import { useColumns } from "../model/hooks";
import { findColumnOfTask } from "../lib/drag-utils";
import { KanbanColumn } from "./kanban-column";
import { KanbanOverlay } from "./kanban-overlay";

export function KanbanBoard() {
	const [activeId, setActiveId] = useState<string | null>(null);
	const columns = useColumns();
	const tasksByColumn = useBoardStore((s) => s.tasksByColumn);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor),
	);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const id = event.active.id as string;
			setActiveId(id);
			useBoardStore.getState().setDragging(true, id);
		},
		[],
	);

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { active, over } = event;
			if (!over) return;

			const activeTaskId = active.id as string;
			const overId = over.id as string;

			const state = useBoardStore.getState();
			const sourceColumnId = findColumnOfTask(
				state.tasksByColumn,
				activeTaskId,
			);
			if (!sourceColumnId) return;

			// Determine target column: could be a column ID or a task ID within a column
			let targetColumnId: string | null = null;

			// Check if overId is a column ID
			const isColumn = state.columns.some((c) => c.id === overId);
			if (isColumn) {
				targetColumnId = overId;
			} else {
				// overId is a task ID -- find which column it belongs to
				targetColumnId = findColumnOfTask(state.tasksByColumn, overId);
			}

			if (!targetColumnId || sourceColumnId === targetColumnId) return;

			// Determine insertion index
			const targetTaskIds = state.tasksByColumn[targetColumnId] ?? [];
			const overIndex = targetTaskIds.indexOf(overId);
			const newIndex = overIndex >= 0 ? overIndex : targetTaskIds.length;

			state.moveCard(activeTaskId, sourceColumnId, targetColumnId, newIndex);
		},
		[],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);

			const state = useBoardStore.getState();
			state.setDragging(false, null);
			state.flushPendingTransitions();

			if (!over) return;

			const activeTaskId = active.id as string;
			const overId = over.id as string;

			// Handle reorder within the same column
			const activeColumn = findColumnOfTask(
				state.tasksByColumn,
				activeTaskId,
			);
			if (!activeColumn) return;

			const isColumn = state.columns.some((c) => c.id === overId);
			const overColumn = isColumn
				? overId
				: findColumnOfTask(state.tasksByColumn, overId);

			if (activeColumn === overColumn && !isColumn) {
				const taskIds = state.tasksByColumn[activeColumn] ?? [];
				const oldIndex = taskIds.indexOf(activeTaskId);
				const newIndex = taskIds.indexOf(overId);
				if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
					state.reorderInColumn(activeColumn, oldIndex, newIndex);
				}
			}

			// Log semantic column transitions (placeholders for gateway RPC)
			const finalColumn = findColumnOfTask(
				useBoardStore.getState().tasksByColumn,
				activeTaskId,
			);
			if (finalColumn) {
				const col = state.columns.find((c) => c.id === finalColumn);
				if (col?.semanticRole === "in_progress") {
					console.log("[Kanban] Dispatching task to agent:", activeTaskId);
				} else if (col?.semanticRole === "archived") {
					console.log("[Kanban] Archiving task:", activeTaskId);
				}
			}
		},
		[],
	);

	const handleDragCancel = useCallback(() => {
		setActiveId(null);
		useBoardStore.getState().setDragging(false, null);
	}, []);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			modifiers={[restrictToWindowEdges]}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="flex gap-4 overflow-x-auto p-4">
				{columns.map((column) => (
					<KanbanColumn
						key={column.id}
						column={column}
						taskIds={tasksByColumn[column.id] ?? []}
					/>
				))}
			</div>

			<DragOverlay>
				<KanbanOverlay taskId={activeId} />
			</DragOverlay>
		</DndContext>
	);
}
