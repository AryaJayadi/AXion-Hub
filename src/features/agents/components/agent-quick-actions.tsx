"use client";

import { FileText, MessageSquare, ScrollText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface AgentQuickActionsProps {
	agentId: string;
}

export function AgentQuickActions({ agentId }: AgentQuickActionsProps) {
	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-3">
					{/* Send Message -- disabled, future Phase 4 */}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex">
									<Button
										variant="outline"
										className="w-full justify-start gap-2 opacity-50"
										disabled
									>
										<MessageSquare className="size-4" />
										Send Message
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent>Available after Phase 4</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* View Sessions */}
					<Button variant="outline" className="w-full justify-start gap-2" asChild>
						<Link href={`/agents/${agentId}/sessions`}>
							<MessageSquare className="size-4" />
							View Sessions
						</Link>
					</Button>

					{/* Edit Identity */}
					<Button variant="outline" className="w-full justify-start gap-2" asChild>
						<Link href={`/agents/${agentId}/identity`}>
							<FileText className="size-4" />
							Edit Identity
						</Link>
					</Button>

					{/* View Logs */}
					<Button variant="outline" className="w-full justify-start gap-2" asChild>
						<Link href={`/agents/${agentId}/logs`}>
							<ScrollText className="size-4" />
							View Logs
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
