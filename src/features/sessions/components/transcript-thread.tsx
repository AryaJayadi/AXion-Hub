"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { Bot, Settings, User } from "lucide-react";
import type { TranscriptMessage } from "@/entities/session";
import { cn } from "@/shared/lib/cn";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/tooltip";
import { TranscriptToolBlock } from "./transcript-tool-block";

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

interface MessageItemProps {
	message: TranscriptMessage;
}

function MessageItem({ message }: MessageItemProps) {
	const isAssistant = message.role === "assistant";
	const isSystem = message.role === "system";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className={cn(
						"group flex gap-3 px-4 py-3 transition-colors",
						isAssistant && "bg-muted/30",
						isSystem && "bg-muted/50 border-l-2 border-l-muted-foreground/30",
					)}
				>
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
						{/* Header: role + timestamp */}
						<div className="mb-1 flex items-center gap-2">
							<span className="text-xs font-semibold">{roleLabel(message.role)}</span>
							<span className="text-xs text-muted-foreground">
								{format(message.timestamp, "HH:mm:ss")}
							</span>
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

interface TranscriptThreadProps {
	messages: TranscriptMessage[];
}

export function TranscriptThread({ messages }: TranscriptThreadProps) {
	const shouldVirtualize = messages.length > 50;
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: messages.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 120,
		overscan: 10,
		enabled: shouldVirtualize,
	});

	if (shouldVirtualize) {
		return (
			<div
				ref={parentRef}
				className="max-h-[calc(100vh-300px)] overflow-auto rounded-lg border border-border"
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => {
						const message = messages[virtualItem.index];
						if (!message) return null;
						return (
							<div
								key={virtualItem.key}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualItem.start}px)`,
								}}
								data-index={virtualItem.index}
								ref={virtualizer.measureElement}
							>
								<MessageItem message={message} />
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-border divide-y divide-border/50">
			{messages.map((message) => (
				<MessageItem key={message.id} message={message} />
			))}
		</div>
	);
}
