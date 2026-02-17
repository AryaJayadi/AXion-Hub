import type { Meta, StoryObj } from "@storybook/react";
import {
	Copy,
	Edit,
	Pause,
	Play,
	Settings,
	Trash2,
} from "lucide-react";

import { ActionMenu } from "./action-menu";
import { Button } from "./button";

const meta: Meta<typeof ActionMenu> = {
	title: "Shared/ActionMenu",
	component: ActionMenu,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ActionMenu>;

export const Default: Story = {
	args: {
		items: [
			{ label: "Edit", icon: <Edit className="size-4" />, onClick: () => {} },
			{ label: "Duplicate", icon: <Copy className="size-4" />, onClick: () => {} },
			{ label: "Settings", icon: <Settings className="size-4" />, onClick: () => {} },
			{ type: "separator" },
			{
				label: "Delete",
				icon: <Trash2 className="size-4" />,
				onClick: () => {},
				variant: "destructive",
			},
		],
	},
};

export const WithCustomTrigger: Story = {
	render: () => (
		<ActionMenu
			trigger={
				<Button variant="outline" size="sm">
					Actions
				</Button>
			}
			items={[
				{ label: "Start Agent", icon: <Play className="size-4" />, onClick: () => {} },
				{ label: "Pause Agent", icon: <Pause className="size-4" />, onClick: () => {} },
				{ type: "separator" },
				{
					label: "Remove",
					icon: <Trash2 className="size-4" />,
					onClick: () => {},
					variant: "destructive",
				},
			]}
		/>
	),
};

export const WithDisabledItems: Story = {
	args: {
		items: [
			{ label: "Edit", icon: <Edit className="size-4" />, onClick: () => {} },
			{
				label: "Duplicate (unavailable)",
				icon: <Copy className="size-4" />,
				onClick: () => {},
				disabled: true,
			},
			{ type: "separator" },
			{
				label: "Delete",
				icon: <Trash2 className="size-4" />,
				onClick: () => {},
				variant: "destructive",
				disabled: true,
			},
		],
	},
};

export const SimpleMenu: Story = {
	args: {
		items: [
			{ label: "View Details", onClick: () => {} },
			{ label: "Edit", onClick: () => {} },
			{ label: "Remove", onClick: () => {}, variant: "destructive" },
		],
	},
};
