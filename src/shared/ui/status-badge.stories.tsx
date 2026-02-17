import type { Meta, StoryObj } from "@storybook/react";

import { StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
	title: "Shared/StatusBadge",
	component: StatusBadge,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

const allStatuses = [
	"online",
	"connected",
	"active",
	"idle",
	"standby",
	"working",
	"running",
	"in-progress",
	"error",
	"failed",
	"offline",
	"warning",
	"degraded",
	"unknown",
	"pending",
];

export const AllVariants: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="mb-3 text-sm font-medium text-foreground">All Status Variants</h3>
				<div className="flex flex-wrap gap-3">
					{allStatuses.map((status) => (
						<StatusBadge key={status} status={status} />
					))}
				</div>
			</div>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<span className="w-10 text-xs text-muted-foreground">sm</span>
				<StatusBadge status="online" size="sm" />
				<StatusBadge status="working" size="sm" />
				<StatusBadge status="error" size="sm" />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-10 text-xs text-muted-foreground">md</span>
				<StatusBadge status="online" size="md" />
				<StatusBadge status="working" size="md" />
				<StatusBadge status="error" size="md" />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-10 text-xs text-muted-foreground">lg</span>
				<StatusBadge status="online" size="lg" />
				<StatusBadge status="working" size="lg" />
				<StatusBadge status="error" size="lg" />
			</div>
		</div>
	),
};

export const WithoutDot: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			{["online", "working", "error", "idle", "warning", "unknown"].map((status) => (
				<StatusBadge key={status} status={status} showDot={false} />
			))}
		</div>
	),
};

export const CustomLabel: Story = {
	render: () => (
		<div className="flex gap-3">
			<StatusBadge status="online" label="Connected to Gateway" />
			<StatusBadge status="error" label="Connection Failed" />
			<StatusBadge status="working" label="Processing 42 tasks" />
		</div>
	),
};

export const AnimatedDot: Story = {
	render: () => (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				The &quot;working&quot; variant has a pulsing dot animation
			</p>
			<div className="flex gap-4">
				<StatusBadge status="working" size="lg" />
				<StatusBadge status="running" size="lg" />
				<StatusBadge status="in-progress" size="lg" />
			</div>
		</div>
	),
};
