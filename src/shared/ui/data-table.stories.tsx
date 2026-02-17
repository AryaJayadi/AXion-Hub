import type { Meta, StoryObj } from "@storybook/react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "./data-table";
import { StatusBadge } from "./status-badge";

const meta: Meta<typeof DataTable> = {
	title: "Shared/DataTable",
	component: DataTable,
	tags: ["autodocs"],
};
export default meta;

// --- Mock data types ---

type Agent = {
	id: string;
	name: string;
	model: string;
	status: string;
	tasks: number;
	lastActive: string;
};

const statuses = ["online", "idle", "working", "error", "offline"];
const models = ["GPT-4o", "Claude 3.5", "Gemini Pro", "Mistral Large", "Llama 3.1"];

function generateAgents(count: number): Agent[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `agent-${(i + 1).toString().padStart(3, "0")}`,
		name: `Agent ${i + 1}`,
		model: models[i % models.length]!,
		status: statuses[i % statuses.length]!,
		tasks: Math.floor(Math.random() * 500),
		lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toLocaleDateString(),
	}));
}

const columns: ColumnDef<Agent, unknown>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
	},
	{
		accessorKey: "name",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
	},
	{
		accessorKey: "model",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
	},
	{
		accessorKey: "tasks",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Tasks" />,
	},
	{
		accessorKey: "lastActive",
		header: "Last Active",
	},
];

// --- Stories ---

export const Default: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<DataTable
			columns={columns}
			data={generateAgents(12)}
			searchKey="name"
			searchPlaceholder="Search agents..."
		/>
	),
};

export const WithSorting: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">Click column headers to sort</p>
			<DataTable
				columns={columns}
				data={generateAgents(25)}
				searchKey="name"
				searchPlaceholder="Search agents..."
			/>
		</div>
	),
};

export const VirtualScrolling: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				150 rows with virtual scrolling -- scroll to see rows rendered on demand
			</p>
			<DataTable
				columns={columns}
				data={generateAgents(150)}
				enableVirtualization
				searchKey="name"
				searchPlaceholder="Search agents..."
			/>
		</div>
	),
};

export const Loading: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<DataTable
			columns={columns}
			data={[]}
			isLoading
			searchKey="name"
			searchPlaceholder="Search agents..."
		/>
	),
};

export const Empty: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<DataTable
			columns={columns}
			data={[]}
			searchKey="name"
			searchPlaceholder="Search agents..."
		/>
	),
};

export const WithRowSelection: StoryObj<typeof DataTable<Agent, unknown>> = {
	render: () => (
		<DataTable
			columns={columns}
			data={generateAgents(10)}
			enableRowSelection
			searchKey="name"
			searchPlaceholder="Search agents..."
		/>
	),
};
