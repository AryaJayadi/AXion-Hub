/**
 * Quick command definitions for chat.
 *
 * Commands are accessible via both the slash autocomplete popover (type '/'
 * in the chat input) and the Cmd+K global command palette. Both interfaces
 * render the same command list and execute the same action handlers.
 *
 * Each command receives a CommandContext with the current conversation state
 * and gateway client for executing actions.
 */

import type { LucideIcon } from "lucide-react";
import { Plus, Minimize2, Activity, RotateCcw } from "lucide-react";
import type { GatewayClient } from "@/features/gateway-connection/lib/gateway-client";

export interface QuickCommand {
	id: string;
	label: string;
	description: string;
	icon: LucideIcon;
	keywords: string[];
	shortcut?: string | undefined;
	action: (context: CommandContext) => void | Promise<void>;
}

export interface CommandContext {
	conversationId: string | null;
	agentId: string | null;
	gatewayClient: GatewayClient;
	/** Callback to open the agent picker dialog (wired by command palette / slash popover host) */
	openAgentPicker?: (() => void) | undefined;
	/** Callback to insert a system-style message into the current conversation */
	insertSystemMessage?: ((text: string) => void) | undefined;
}

export const quickCommands: QuickCommand[] = [
	{
		id: "new",
		label: "/new",
		description: "Start a new conversation",
		icon: Plus,
		keywords: ["new", "create", "start", "conversation", "chat"],
		shortcut: "Cmd+N",
		action: (ctx) => {
			ctx.openAgentPicker?.();
		},
	},
	{
		id: "compact",
		label: "/compact",
		description: "Compact the current session",
		icon: Minimize2,
		keywords: ["compact", "compress", "reduce", "context"],
		action: async (ctx) => {
			if (!ctx.conversationId || !ctx.agentId) return;
			try {
				await ctx.gatewayClient.sendMessage(
					ctx.agentId,
					"/compact",
					ctx.conversationId,
				);
			} catch (error) {
				console.error("Failed to compact session:", error);
			}
		},
	},
	{
		id: "status",
		label: "/status",
		description: "Show agent status and session info",
		icon: Activity,
		keywords: ["status", "info", "session", "agent"],
		action: (ctx) => {
			const info = [
				`Conversation: ${ctx.conversationId ?? "none"}`,
				`Agent: ${ctx.agentId ?? "none"}`,
			].join("\n");
			ctx.insertSystemMessage?.(info);
		},
	},
	{
		id: "reset",
		label: "/reset",
		description: "Reset the current session",
		icon: RotateCcw,
		keywords: ["reset", "clear", "restart"],
		action: async (ctx) => {
			if (!ctx.conversationId || !ctx.agentId) return;
			try {
				await ctx.gatewayClient.sendMessage(
					ctx.agentId,
					"/reset",
					ctx.conversationId,
				);
			} catch (error) {
				console.error("Failed to reset session:", error);
			}
		},
	},
];

/**
 * Filter commands by a search query.
 * Matches against label and keywords (case-insensitive includes).
 */
export function filterCommands(
	commands: QuickCommand[],
	filter: string,
): QuickCommand[] {
	if (!filter.trim()) return commands;
	const q = filter.toLowerCase();
	return commands.filter(
		(cmd) =>
			cmd.label.toLowerCase().includes(q) ||
			cmd.description.toLowerCase().includes(q) ||
			cmd.keywords.some((kw) => kw.includes(q)),
	);
}
