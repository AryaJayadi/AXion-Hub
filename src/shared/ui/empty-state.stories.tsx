import type { Meta, StoryObj } from "@storybook/react";
import { Bot, Inbox, Search, Wifi } from "lucide-react";

import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
	title: "Shared/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
	args: {
		title: "No agents yet",
		description:
			"Create your first agent to start automating tasks and managing workflows.",
		action: {
			label: "Create Agent",
			onClick: () => {},
		},
	},
};

export const WithCustomIcon: Story = {
	render: () => (
		<EmptyState
			icon={<Bot className="size-16 text-muted-foreground/40" />}
			title="No agents deployed"
			description="Deploy an agent to start monitoring its performance and activity."
			action={{
				label: "Deploy Agent",
				onClick: () => {},
			}}
		/>
	),
};

export const SearchNoResults: Story = {
	render: () => (
		<EmptyState
			icon={<Search className="size-16 text-muted-foreground/40" />}
			title="No results found"
			description='No agents match your search criteria. Try adjusting your filters or search terms.'
		/>
	),
};

export const NoConnection: Story = {
	render: () => (
		<EmptyState
			icon={<Wifi className="size-16 text-muted-foreground/40" />}
			title="Not connected to gateway"
			description="Connect to an OpenClaw Gateway to view and manage your agents."
			action={{
				label: "Connect",
				onClick: () => {},
			}}
		/>
	),
};

export const EmptyInbox: Story = {
	render: () => (
		<EmptyState
			icon={<Inbox className="size-16 text-muted-foreground/40" />}
			title="No notifications"
			description="You're all caught up. New alerts and notifications will appear here."
		/>
	),
};

export const WithoutAction: Story = {
	args: {
		title: "No data available",
		description:
			"This section will populate once agents begin reporting telemetry data.",
	},
};

export const AllVariations: Story = {
	render: () => (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div className="rounded-lg border border-border p-4">
				<EmptyState
					title="No agents yet"
					description="Create your first agent to get started."
					action={{ label: "Create Agent", onClick: () => {} }}
				/>
			</div>
			<div className="rounded-lg border border-border p-4">
				<EmptyState
					icon={<Bot className="size-16 text-muted-foreground/40" />}
					title="No sessions"
					description="Active sessions will appear here once agents start running."
				/>
			</div>
			<div className="rounded-lg border border-border p-4">
				<EmptyState
					icon={<Search className="size-16 text-muted-foreground/40" />}
					title="No matches"
					description="Try adjusting your search or filters."
				/>
			</div>
			<div className="rounded-lg border border-border p-4">
				<EmptyState
					title="No data"
					description="Data will appear here as activity is recorded."
				/>
			</div>
		</div>
	),
};
