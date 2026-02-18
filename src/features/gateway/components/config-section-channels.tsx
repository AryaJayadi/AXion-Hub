"use client";

import type { ChannelConfig } from "@/entities/gateway-config";
import { Badge } from "@/shared/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";

interface ConfigSectionChannelsProps {
	values: Record<string, ChannelConfig>;
	onUpdate: (values: Record<string, ChannelConfig>) => void;
}

export function ConfigSectionChannels({
	values,
}: ConfigSectionChannelsProps) {
	const entries = Object.entries(values);

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Channel configurations are read-only here. Manage channels at{" "}
				<a href="/channels" className="text-primary underline underline-offset-4 hover:text-primary/80">
					/channels
				</a>
				.
			</p>

			{entries.length === 0 ? (
				<p className="text-sm text-muted-foreground italic">No channels configured</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Platform</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entries.map(([name, config]) => (
							<TableRow key={name}>
								<TableCell className="font-medium">{name}</TableCell>
								<TableCell>{config.platform}</TableCell>
								<TableCell>
									<Badge variant={config.enabled ? "default" : "secondary"}>
										{config.enabled ? "Enabled" : "Disabled"}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
