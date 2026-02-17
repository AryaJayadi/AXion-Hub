import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Settings } from "lucide-react";

import { Button } from "./button";
import { PageHeader } from "./page-header";

const meta: Meta<typeof PageHeader> = {
	title: "Shared/PageHeader",
	component: PageHeader,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
	args: {
		title: "Agents",
		description: "Manage and monitor your AI agents across all gateways.",
	},
};

export const WithActions: Story = {
	render: () => (
		<PageHeader
			title="Agents"
			description="Manage and monitor your AI agents across all gateways."
			actions={
				<>
					<Button variant="outline" size="sm">
						<Settings className="mr-1.5 size-4" />
						Settings
					</Button>
					<Button size="sm">
						<Plus className="mr-1.5 size-4" />
						New Agent
					</Button>
				</>
			}
		/>
	),
};

export const WithBreadcrumbs: Story = {
	render: () => (
		<PageHeader
			title="Agent Configuration"
			description="Configure runtime parameters and model settings."
			breadcrumbs={[
				{ label: "Dashboard", href: "/" },
				{ label: "Agents", href: "/agents" },
				{ label: "Agent Configuration" },
			]}
			actions={
				<Button size="sm">
					Save Changes
				</Button>
			}
		/>
	),
};

export const TitleOnly: Story = {
	args: {
		title: "Dashboard",
	},
};

export const LongContent: Story = {
	render: () => (
		<PageHeader
			title="Security & Access Control"
			description="Configure authentication providers, role-based permissions, API key management, and audit trail settings for your organization."
			breadcrumbs={[
				{ label: "Dashboard", href: "/" },
				{ label: "Settings", href: "/settings" },
				{ label: "Security & Access Control" },
			]}
			actions={
				<>
					<Button variant="outline" size="sm">
						Export Audit Log
					</Button>
					<Button variant="outline" size="sm">
						Manage Roles
					</Button>
					<Button size="sm">
						Add Provider
					</Button>
				</>
			}
		/>
	),
};
