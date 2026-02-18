"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";

interface ChannelBinding {
	id: string;
	name: string;
	type: "whatsapp" | "telegram" | "discord" | "slack";
	rule: string;
	status: "connected" | "disconnected";
}

const typeBadgeClass: Record<ChannelBinding["type"], string> = {
	whatsapp: "bg-green-500/10 text-green-500 border-green-500/20",
	telegram: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	discord: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
	slack: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const MOCK_CHANNELS: ChannelBinding[] = [
	{
		id: "ch-001",
		name: "Support Channel",
		type: "slack",
		rule: "Route all customer support messages",
		status: "connected",
	},
	{
		id: "ch-002",
		name: "Dev Notifications",
		type: "discord",
		rule: "Forward deployment and CI/CD events",
		status: "connected",
	},
	{
		id: "ch-003",
		name: "Alert Bot",
		type: "telegram",
		rule: "Send critical error alerts",
		status: "disconnected",
	},
	{
		id: "ch-004",
		name: "Customer Intake",
		type: "whatsapp",
		rule: "Handle initial customer inquiries",
		status: "connected",
	},
];

export function AgentChannelsTable() {
	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Channel Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Routing Rule</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{MOCK_CHANNELS.map((channel) => (
							<TableRow key={channel.id}>
								<TableCell className="font-medium">{channel.name}</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={typeBadgeClass[channel.type]}
									>
										{channel.type}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									{channel.rule}
								</TableCell>
								<TableCell>
									<Badge
										variant={channel.status === "connected" ? "default" : "secondary"}
									>
										{channel.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<p className="text-xs text-muted-foreground">
				Channel configuration is managed in the Channels section. Full channel management will
				be available in a future update.
			</p>
		</div>
	);
}
