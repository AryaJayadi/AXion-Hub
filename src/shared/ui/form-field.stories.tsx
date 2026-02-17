import type { Meta, StoryObj } from "@storybook/react";

import { FormField } from "./form-field";
import { Input } from "./input";

const meta: Meta<typeof FormField> = {
	title: "Shared/FormField",
	component: FormField,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {
	render: () => (
		<div className="max-w-sm">
			<FormField label="Agent Name">
				<Input placeholder="Enter agent name" />
			</FormField>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="max-w-sm">
			<FormField
				label="API Key"
				description="Your API key is used to authenticate requests to the gateway."
			>
				<Input placeholder="sk-..." type="password" />
			</FormField>
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div className="max-w-sm">
			<FormField label="Agent Name" required>
				<Input placeholder="Enter agent name" />
			</FormField>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="max-w-sm">
			<FormField
				label="Agent Name"
				required
				error="Agent name must be at least 3 characters."
			>
				<Input placeholder="Enter agent name" defaultValue="AB" aria-invalid />
			</FormField>
		</div>
	),
};

export const AllStates: Story = {
	render: () => (
		<div className="max-w-sm space-y-6">
			<FormField label="Normal Field">
				<Input placeholder="Normal input" />
			</FormField>

			<FormField label="With Description" description="This field has a description below the label.">
				<Input placeholder="With description" />
			</FormField>

			<FormField label="Required Field" required>
				<Input placeholder="Required input" />
			</FormField>

			<FormField label="Error Field" required error="This field is required.">
				<Input placeholder="Error input" aria-invalid />
			</FormField>

			<FormField
				label="Full Example"
				description="Enter the model identifier used by this agent."
				required
				error="Invalid model identifier format."
			>
				<Input placeholder="gpt-4o" defaultValue="invalid model!" aria-invalid />
			</FormField>
		</div>
	),
};
