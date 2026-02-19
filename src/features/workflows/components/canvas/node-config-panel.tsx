"use client";

/**
 * Right sidebar config panel for selected workflow nodes.
 *
 * Shows when a node is selected. Displays type-specific configuration
 * fields that update the node data in real time via the canvas store.
 */

import { useMemo } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { WorkflowNodeType } from "@/entities/workflow";
import { getNodeCategory, getNodeRegistryEntry } from "@/entities/workflow";
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NodeConfigPanel() {
	const selectedNodeId = useWorkflowCanvasStore((s) => s.selectedNodeId);
	const nodes = useWorkflowCanvasStore((s) => s.nodes);
	const updateNodeData = useWorkflowCanvasStore((s) => s.updateNodeData);
	const selectNode = useWorkflowCanvasStore((s) => s.selectNode);

	const selectedNode = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId),
		[nodes, selectedNodeId],
	);

	const isOpen = selectedNode != null;

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

						{/* Config fields */}
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
					</div>
				</motion.div>
			)}
		</AnimatePresence>
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
