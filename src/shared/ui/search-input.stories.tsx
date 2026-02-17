"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { SearchInput } from "./search-input";

const meta: Meta<typeof SearchInput> = {
	title: "Shared/SearchInput",
	component: SearchInput,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

function SearchInputDemo({
	placeholder,
	debounceMs,
}: {
	placeholder?: string;
	debounceMs?: number;
}) {
	const [value, setValue] = useState("");
	const [debouncedValue, setDebouncedValue] = useState("");

	return (
		<div className="max-w-md space-y-4">
			<SearchInput
				value={value}
				onChange={(v) => {
					setValue(v);
					setDebouncedValue(v);
				}}
				placeholder={placeholder}
				debounceMs={debounceMs}
			/>
			<div className="rounded-md border border-border bg-muted/30 p-3">
				<p className="text-xs text-muted-foreground">
					<strong>Debounced value:</strong>{" "}
					{debouncedValue ? (
						<code className="text-foreground">{debouncedValue}</code>
					) : (
						<span className="italic">empty</span>
					)}
				</p>
			</div>
		</div>
	);
}

export const Default: Story = {
	render: () => <SearchInputDemo />,
};

export const CustomPlaceholder: Story = {
	render: () => <SearchInputDemo placeholder="Search agents by name..." />,
};

export const FastDebounce: Story = {
	render: () => (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				100ms debounce -- updates almost instantly
			</p>
			<SearchInputDemo debounceMs={100} placeholder="Fast search..." />
		</div>
	),
};

export const SlowDebounce: Story = {
	render: () => (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				1000ms debounce -- waits a full second after typing stops
			</p>
			<SearchInputDemo debounceMs={1000} placeholder="Slow search..." />
		</div>
	),
};

export const PrefilledValue: Story = {
	render: () => {
		const [value, setValue] = useState("existing search term");

		return (
			<div className="max-w-md space-y-4">
				<p className="text-sm text-muted-foreground">
					Pre-filled with a value. Click the X to clear.
				</p>
				<SearchInput
					value={value}
					onChange={setValue}
					placeholder="Search..."
				/>
			</div>
		);
	},
};
