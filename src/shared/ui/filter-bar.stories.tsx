"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { FilterBar, type FilterConfig } from "./filter-bar";

const meta: Meta<typeof FilterBar> = {
	title: "Shared/FilterBar",
	component: FilterBar,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

const statusFilters: FilterConfig[] = [
	{
		key: "status",
		label: "Status",
		type: "select",
		options: [
			{ label: "Online", value: "online" },
			{ label: "Idle", value: "idle" },
			{ label: "Working", value: "working" },
			{ label: "Error", value: "error" },
			{ label: "Offline", value: "offline" },
		],
	},
	{
		key: "model",
		label: "Model",
		type: "select",
		options: [
			{ label: "GPT-4o", value: "gpt-4o" },
			{ label: "Claude 3.5", value: "claude-3.5" },
			{ label: "Gemini Pro", value: "gemini-pro" },
		],
	},
	{
		key: "search",
		label: "Search agents...",
		type: "text",
	},
];

function FilterBarDemo({ filters }: { filters: FilterConfig[] }) {
	const [values, setValues] = useState<Record<string, unknown>>({});

	return (
		<FilterBar
			filters={filters}
			values={values}
			onChange={(key, value) =>
				setValues((prev) => ({ ...prev, [key]: value }))
			}
			onClear={() => setValues({})}
		/>
	);
}

export const Default: Story = {
	render: () => <FilterBarDemo filters={statusFilters} />,
};

export const WithActiveFilters: Story = {
	render: () => {
		const [values, setValues] = useState<Record<string, unknown>>({
			status: "online",
			model: "gpt-4o",
		});

		return (
			<FilterBar
				filters={statusFilters}
				values={values}
				onChange={(key, value) =>
					setValues((prev) => ({ ...prev, [key]: value }))
				}
				onClear={() => setValues({})}
			/>
		);
	},
};

export const MultiSelect: Story = {
	render: () => {
		const filters: FilterConfig[] = [
			{
				key: "tags",
				label: "Tags",
				type: "multi-select",
				options: [
					{ label: "Production", value: "prod" },
					{ label: "Staging", value: "staging" },
					{ label: "Development", value: "dev" },
					{ label: "Critical", value: "critical" },
				],
			},
			{
				key: "status",
				label: "Status",
				type: "select",
				options: [
					{ label: "Active", value: "active" },
					{ label: "Inactive", value: "inactive" },
				],
			},
		];

		return <FilterBarDemo filters={filters} />;
	},
};

export const TextOnly: Story = {
	render: () => {
		const filters: FilterConfig[] = [
			{ key: "name", label: "Name", type: "text" },
			{ key: "id", label: "Agent ID", type: "text" },
		];

		return <FilterBarDemo filters={filters} />;
	},
};
