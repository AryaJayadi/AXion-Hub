"use client";

/**
 * Right sidebar config panel for selected workflow nodes.
 *
 * Shows when a node is selected. Displays type-specific configuration
 * fields that update the node data in real time via the canvas store.
 */

import { useMemo } from "react";
import { X, Clock, AlertCircle, CheckCircle2, Loader2, MinusCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { WorkflowNodeType, NodeExecutionState } from "@/entities/workflow";
import { getNodeCategory, getNodeRegistryEntry } from "@/entities/workflow";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/cn";
import { useWorkflowCanvasStore } from "../../model/workflow-canvas-store";
import { useExecutionStore } from "../../model/execution-store";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface NodeConfigPanelProps {
	isRunning?: boolean;
}

export function NodeConfigPanel({ isRunning }: NodeConfigPanelProps) {
	const selectedNodeId = useWorkflowCanvasStore((s) => s.selectedNodeId);
	const nodes = useWorkflowCanvasStore((s) => s.nodes);
	const updateNodeData = useWorkflowCanvasStore((s) => s.updateNodeData);
	const selectNode = useWorkflowCanvasStore((s) => s.selectNode);
	const nodeStates = useExecutionStore((s) => s.nodeStates);

	const selectedNode = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId),
		[nodes, selectedNodeId],
	);

	const isOpen = selectedNode != null;

	// Get execution state for selected node (when running)
	const executionState = selectedNodeId
		? nodeStates.get(selectedNodeId) ?? null
		: null;
	const showExecutionView = !!isRunning && !!executionState;

	return (
		<AnimatePresence>
			{isOpen && selectedNode && (
				<motion.div
					initial={{ width: 0, opacity: 0 }}
					animate={{ width: 320, opacity: 1 }}
					exit={{ width: 0, opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="h-full overflow-hidden border-l bg-background"
				>
					<div className="flex h-full w-80 flex-col overflow-y-auto">
						{/* Header */}
						<PanelHeader
							nodeType={selectedNode.type as WorkflowNodeType}
							onClose={() => selectNode(null)}
						/>

						{showExecutionView ? (
							/* Execution I/O display mode */
							<ExecutionIOView executionState={executionState} />
						) : (
							/* Normal config fields mode */
							<div className="flex-1 space-y-4 p-4">
								{/* Label (always shown) */}
								<div className="space-y-1.5">
									<Label htmlFor="node-label">Label</Label>
									<Input
										id="node-label"
										value={(selectedNode.data.label as string) ?? ""}
										onChange={(e) =>
											updateNodeData(selectedNode.id, {
												label: e.target.value,
											})
										}
									/>
								</div>

								{/* Type-specific fields */}
								<NodeConfigFields
									nodeId={selectedNode.id}
									nodeType={
										selectedNode.type as WorkflowNodeType
									}
									data={
										selectedNode.data as Record<
											string,
											unknown
										>
									}
									updateData={(data) =>
										updateNodeData(selectedNode.id, data)
									}
								/>
							</div>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ---------------------------------------------------------------------------
// Execution I/O view (shown during live runs)
// ---------------------------------------------------------------------------

const EXEC_STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
	pending: { icon: MinusCircle, color: "text-muted-foreground", label: "Pending" },
	running: { icon: Loader2, color: "text-blue-500", label: "Running" },
	success: { icon: CheckCircle2, color: "text-green-500", label: "Success" },
	error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
	skipped: { icon: MinusCircle, color: "text-muted-foreground/60", label: "Skipped" },
};

const DEFAULT_EXEC_STATUS = { icon: MinusCircle, color: "text-muted-foreground", label: "Pending" } as const;

function ExecutionIOView({ executionState }: { executionState: NodeExecutionState }) {
	const config = EXEC_STATUS_CONFIG[executionState.status] ?? DEFAULT_EXEC_STATUS;
	const StatusIcon = config.icon;

	const duration = executionState.startedAt && executionState.completedAt
		? executionState.completedAt.getTime() - executionState.startedAt.getTime()
		: null;

	return (
		<div className="flex-1 space-y-4 p-4">
			{/* Status badge */}
			<div className="space-y-1.5">
				<Label>Status</Label>
				<Badge
					variant="outline"
					className={cn("gap-1.5", config.color)}
				>
					<StatusIcon className={cn("size-3.5", executionState.status === "running" && "animate-spin")} />
					{config.label}
				</Badge>
			</div>

			{/* Input */}
			<div className="space-y-1.5">
				<Label>Input</Label>
				<pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-48">
					{executionState.input
						? JSON.stringify(executionState.input, null, 2)
						: "No input"}
				</pre>
			</div>

			{/* Output */}
			<div className="space-y-1.5">
				<Label>Output</Label>
				<pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-48">
					{executionState.status === "pending" || executionState.status === "running"
						? "Waiting..."
						: executionState.output
							? JSON.stringify(executionState.output, null, 2)
							: "No output"}
				</pre>
			</div>

			{/* Error (only if status is error) */}
			{executionState.status === "error" && executionState.error && (
				<div className="space-y-1.5">
					<Label className="text-red-500">Error</Label>
					<div className="rounded border border-red-200 bg-red-500/5 p-2 text-xs text-red-600">
						{executionState.error}
					</div>
				</div>
			)}

			{/* Timing */}
			<div className="space-y-1.5">
				<Label>Timing</Label>
				<div className="space-y-1 text-xs text-muted-foreground">
					{executionState.startedAt && (
						<div className="flex items-center gap-1.5">
							<Clock className="size-3" />
							<span>Started: {executionState.startedAt.toLocaleTimeString()}</span>
						</div>
					)}
					{executionState.completedAt && (
						<div className="flex items-center gap-1.5">
							<Clock className="size-3" />
							<span>Completed: {executionState.completedAt.toLocaleTimeString()}</span>
						</div>
					)}
					{duration != null && (
						<div className="flex items-center gap-1.5">
							<Clock className="size-3" />
							<span>Duration: {duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Panel header
// ---------------------------------------------------------------------------

function PanelHeader({
	nodeType,
	onClose,
}: {
	nodeType: WorkflowNodeType;
	onClose: () => void;
}) {
	const entry = getNodeRegistryEntry(nodeType);
	const category = getNodeCategory(nodeType);

	return (
		<div className="flex items-center justify-between border-b px-4 py-3">
			<div className="flex items-center gap-2 min-w-0">
				<span className="text-sm font-semibold text-foreground truncate">
					{entry?.label ?? nodeType}
				</span>
				<span
					className={cn(
						"inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
						category.bg,
						category.text,
					)}
				>
					{entry?.category ?? "unknown"}
				</span>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="size-7 shrink-0"
				onClick={onClose}
			>
				<X className="size-4" />
				<span className="sr-only">Close panel</span>
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Type-specific config fields
// ---------------------------------------------------------------------------

interface NodeConfigFieldsProps {
	nodeId: string;
	nodeType: WorkflowNodeType;
	data: Record<string, unknown>;
	updateData: (data: Record<string, unknown>) => void;
}

function NodeConfigFields({
	nodeType,
	data,
	updateData,
}: NodeConfigFieldsProps) {
	switch (nodeType) {
		case "trigger":
			return (
				<div className="space-y-1.5">
					<Label>Trigger type</Label>
					<Select
						value={(data.subType as string) ?? "manual"}
						onValueChange={(v) => updateData({ subType: v })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="manual">Manual</SelectItem>
							<SelectItem value="cron">Scheduled (Cron)</SelectItem>
							<SelectItem value="webhook">Webhook</SelectItem>
							<SelectItem value="event">Event</SelectItem>
						</SelectContent>
					</Select>
				</div>
			);

		case "agentAction":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Agent</Label>
						<Select
							value={(data.agentName as string) ?? ""}
							onValueChange={(v) => updateData({ agentName: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select agent" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Research Agent">
									Research Agent
								</SelectItem>
								<SelectItem value="Code Assistant">
									Code Assistant
								</SelectItem>
								<SelectItem value="Data Analyst">
									Data Analyst
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Action description</Label>
						<Textarea
							value={(data.actionDescription as string) ?? ""}
							onChange={(e) =>
								updateData({
									actionDescription: e.target.value,
								})
							}
							placeholder="Describe what the agent should do..."
							rows={3}
						/>
					</div>
				</>
			);

		case "condition":
			return (
				<div className="space-y-1.5">
					<Label>Expression</Label>
					<Input
						value={(data.expression as string) ?? ""}
						onChange={(e) =>
							updateData({ expression: e.target.value })
						}
						placeholder="e.g. data.score > 0.8"
						className="font-mono text-sm"
					/>
				</div>
			);

		case "delay":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Duration</Label>
						<Input
							type="number"
							min={1}
							value={(data.duration as number) ?? 5}
							onChange={(e) =>
								updateData({
									duration: Number.parseInt(e.target.value, 10) || 1,
								})
							}
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Unit</Label>
						<Select
							value={(data.unit as string) ?? "minutes"}
							onValueChange={(v) => updateData({ unit: v })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="seconds">Seconds</SelectItem>
								<SelectItem value="minutes">Minutes</SelectItem>
								<SelectItem value="hours">Hours</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</>
			);

		case "transform":
			return (
				<div className="space-y-1.5">
					<Label>Mapping description</Label>
					<Textarea
						value={(data.mapping as string) ?? ""}
						onChange={(e) =>
							updateData({ mapping: e.target.value })
						}
						placeholder="Describe the data transformation..."
						rows={3}
					/>
				</div>
			);

		case "output":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Output type</Label>
						<Select
							value={(data.outputType as string) ?? "notify"}
							onValueChange={(v) =>
								updateData({ outputType: v })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="notify">
									Notification
								</SelectItem>
								<SelectItem value="log">Log</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Target</Label>
						<Input
							value={(data.target as string) ?? ""}
							onChange={(e) =>
								updateData({ target: e.target.value })
							}
							placeholder="e.g. #alerts channel"
						/>
					</div>
				</>
			);

		case "loop":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Iteration count</Label>
						<Input
							type="number"
							min={1}
							value={(data.count as number) ?? 10}
							onChange={(e) =>
								updateData({
									count:
										Number.parseInt(e.target.value, 10) ||
										1,
								})
							}
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Collection reference</Label>
						<Input
							value={(data.collection as string) ?? ""}
							onChange={(e) =>
								updateData({ collection: e.target.value })
							}
							placeholder="e.g. data.items"
						/>
					</div>
				</>
			);

		case "parallel":
			return (
				<div className="space-y-1.5">
					<Label>Branch count</Label>
					<Input
						type="number"
						min={2}
						value={(data.branchCount as number) ?? 2}
						onChange={(e) =>
							updateData({
								branchCount:
									Number.parseInt(e.target.value, 10) || 2,
							})
						}
					/>
				</div>
			);

		case "httpRequest":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Method</Label>
						<Select
							value={(data.method as string) ?? "GET"}
							onValueChange={(v) => updateData({ method: v })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="GET">GET</SelectItem>
								<SelectItem value="POST">POST</SelectItem>
								<SelectItem value="PUT">PUT</SelectItem>
								<SelectItem value="DELETE">DELETE</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>URL</Label>
						<Input
							value={(data.url as string) ?? ""}
							onChange={(e) =>
								updateData({ url: e.target.value })
							}
							placeholder="https://api.example.com/endpoint"
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Body</Label>
						<Textarea
							value={(data.body as string) ?? ""}
							onChange={(e) =>
								updateData({ body: e.target.value })
							}
							placeholder='{"key": "value"}'
							rows={4}
							className="font-mono text-sm"
						/>
					</div>
				</>
			);

		case "code":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Language</Label>
						<Select
							value={(data.language as string) ?? "javascript"}
							onValueChange={(v) =>
								updateData({ language: v })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="javascript">
									JavaScript
								</SelectItem>
								<SelectItem value="python">Python</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Code</Label>
						<Textarea
							value={(data.code as string) ?? ""}
							onChange={(e) =>
								updateData({ code: e.target.value })
							}
							placeholder="// Your code here..."
							rows={8}
							className="font-mono text-sm"
						/>
					</div>
				</>
			);

		case "approvalGate":
			return (
				<>
					<div className="space-y-1.5">
						<Label>Approver</Label>
						<Input
							value={(data.approver as string) ?? ""}
							onChange={(e) =>
								updateData({ approver: e.target.value })
							}
							placeholder="e.g. team-lead@company.com"
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Timeout</Label>
						<Input
							value={(data.timeout as string) ?? "24h"}
							onChange={(e) =>
								updateData({ timeout: e.target.value })
							}
							placeholder="e.g. 24h, 7d"
						/>
					</div>
				</>
			);

		case "subWorkflow":
			return (
				<div className="space-y-1.5">
					<Label>Workflow ID</Label>
					<Input
						value={(data.workflowId as string) ?? ""}
						onChange={(e) =>
							updateData({ workflowId: e.target.value })
						}
						placeholder="e.g. wf-123"
					/>
				</div>
			);

		default:
			return (
				<p className="text-sm text-muted-foreground">
					No configuration available for this node type.
				</p>
			);
	}
}
