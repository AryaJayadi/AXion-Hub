import type { Preview } from "@storybook/react";
import "../src/app/styles/globals.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "dark",
			values: [
				{ name: "dark", value: "oklch(0.1797 0.0043 308.19)" },
				{ name: "light", value: "oklch(0.9846 0.0020 308.19)" },
			],
		},
	},
	decorators: [
		(Story) => (
			<div className="dark bg-background text-foreground p-4">
				<Story />
			</div>
		),
	],
};

export default preview;
