import type { Meta, StoryObj } from "@storybook/react";

function PlaceholderButton({
	variant = "primary",
	children,
}: {
	variant?: "primary" | "secondary" | "destructive";
	children: React.ReactNode;
}) {
	const variantClasses = {
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		destructive: "bg-destructive text-destructive-foreground",
	};

	return (
		<button
			type="button"
			className={`rounded-lg px-4 py-2 text-sm font-medium ${variantClasses[variant]}`}
		>
			{children}
		</button>
	);
}

const meta: Meta<typeof PlaceholderButton> = {
	title: "Shared/PlaceholderButton",
	component: PlaceholderButton,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlaceholderButton>;

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secondary Button",
	},
};

export const Destructive: Story = {
	args: {
		variant: "destructive",
		children: "Destructive Button",
	},
};
