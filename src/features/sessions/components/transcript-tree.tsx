"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Bot, GitBranch, RotateCcw, Settings, User } from "lucide-react";
import type { TranscriptMessage } from "@/entities/session";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/tooltip";
import { TranscriptToolBlock } from "./transcript-tool-block";

interface TreeNode {
	message: TranscriptMessage;
	children: TreeNode[];
	depth: number;
}

function buildTree(messages: TranscriptMessage[]): TreeNode[] {
	const messageMap = new Map<string, TranscriptMessage>();
	const childrenMap = new Map<string, TranscriptMessage[]>();

	for (const msg of messages) {
		messageMap.set(msg.id, msg);
	}

	// Group children by parentMessageId
	for (const msg of messages) {
		if (msg.parentMessageId) {
			const existing = childrenMap.get(msg.parentMessageId);
			if (existing) {
				existing.push(msg);
			} else {
				childrenMap.set(msg.parentMessageId, [msg]);
			}
		}
	}

	// Build tree recursively
	function buildNode(
		msg: TranscriptMessage,
		depth: number,
	): TreeNode {
		const children = (childrenMap.get(msg.id) ?? []).map((child) =>
			buildNode(child, depth + 1),
		);
		return { message: msg, children, depth };
	}

	// Roots are messages without a parentMessageId
	const roots = messages.filter((m) => !m.parentMessageId);
	return roots.map((root) => buildNode(root, 0));
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
	const result: TreeNode[] = [];
	function traverse(node: TreeNode) {
		result.push(node);
		for (const child of node.children) {
			traverse(child);
		}
	}
	for (const node of nodes) {
		traverse(node);
	}
	return result;
}

function RoleIcon({ role }: { role: TranscriptMessage["role"] }) {
	switch (role) {
		case "user":
			return <User className="size-4" />;
		case "assistant":
			return <Bot className="size-4" />;
		case "system":
			return <Settings className="size-4" />;
	}
}

function roleLabel(role: TranscriptMessage["role"]): string {
	switch (role) {
		case "user":
			return "User";
		case "assistant":
			return "Assistant";
		case "system":
			return "System";
	}
}

interface TreeMessageItemProps {
	node: TreeNode;
	hasSibling: boolean;
}

function TreeMessageItem({ node, hasSibling }: TreeMessageItemProps) {
	const { message, depth, children } = node;
	const isAssistant = message.role === "assistant";
	const isSystem = message.role === "system";
	const hasChildren = children.length > 0;
	const isBranch = depth > 0;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className={cn(
						"group relative flex gap-3 px-4 py-3 transition-colors",
						isAssistant && "bg-muted/30",
						isSystem && "bg-muted/50",
					)}
					style={{ marginLeft: `${depth * 24}px` }}
				>
					{/* Branch indicator line */}
					{isBranch && (
						<div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
					)}
					{isBranch && (
						<div className="absolute left-0 top-5 w-3 h-px bg-border" />
					)}
					{hasChildren && (
						<div className="absolute left-[12px] top-[28px] bottom-0 w-px bg-border/50" />
					)}

					{/* Branch dot */}
					{isBranch && (
						<div className="absolute left-[-3px] top-4 size-1.5 rounded-full bg-border" />
					)}

					{/* Role icon */}
					<div
						className={cn(
							"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
							message.role === "user"
								? "bg-primary/10 text-primary"
								: message.role === "assistant"
									? "bg-secondary/10 text-secondary"
									: "bg-muted text-muted-foreground",
						)}
					>
						<RoleIcon role={message.role} />
					</div>

					{/* Content area */}
					<div className="min-w-0 flex-1">
						{/* Header: role + timestamp + badges */}
						<div className="mb-1 flex items-center gap-2">
							<span className="text-xs font-semibold">{roleLabel(message.role)}</span>
							<span className="text-xs text-muted-foreground">
								{format(message.timestamp, "HH:mm:ss")}
							</span>
							{message.isRetry && (
								<Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
									<RotateCcw className="size-2.5" />
									Retry
								</Badge>
							)}
							{hasChildren && (
								<GitBranch className="size-3 text-muted-foreground" />
							)}
						</div>

						{/* Message content */}
						<div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
							{message.content.split("\n").map((line, i) => (
								<p key={`${message.id}-line-${i.toString()}`} className={cn("my-0.5", !line && "h-2")}>
									{line}
								</p>
							))}
						</div>

						{/* Tool calls */}
						{message.toolCalls.length > 0 && (
							<div className="mt-2 space-y-1">
								{message.toolCalls.map((tc) => (
									<TranscriptToolBlock key={tc.id} toolCall={tc} />
								))}
							</div>
						)}
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent side="left" className="text-xs">
				{message.tokenCount.toLocaleString()} tokens
			</TooltipContent>
		</Tooltip>
	);
}

interface TranscriptTreeProps {
	messages: TranscriptMessage[];
}

export function TranscriptTree({ messages }: TranscriptTreeProps) {
	const tree = useMemo(() => buildTree(messages), [messages]);
	const flatNodes = useMemo(() => flattenTree(tree), [tree]);

	return (
		<div className="rounded-lg border border-border divide-y divide-border/50">
			{flatNodes.map((node, index) => (
				<TreeMessageItem
					key={node.message.id}
					node={node}
					hasSibling={
						index < flatNodes.length - 1 &&
						flatNodes[index + 1]!.depth === node.depth
					}
				/>
			))}
		</div>
	);
}
