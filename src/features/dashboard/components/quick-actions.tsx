"use client";

import Link from "next/link";
import { Bot, ListTodo, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";

/**
 * Quick action buttons for common dashboard workflows.
 *
 * DASH-07: New Agent, New Task, Send Message.
 */
export function QuickActions() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button variant="outline" size="sm" asChild>
				<Link href="/agents/new">
					<Bot className="size-4" />
					New Agent
				</Link>
			</Button>

			<Button variant="outline" size="sm" asChild>
				<Link href="/missions/new">
					<ListTodo className="size-4" />
					New Task
				</Link>
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					toast.info(
						"Coming soon -- available when Mission Board launches",
					);
				}}
			>
				<MessageSquare className="size-4" />
				Send Message
			</Button>
		</div>
	);
}
