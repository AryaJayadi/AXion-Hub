"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { ErrorBoundary } from "./error-boundary";

const meta: Meta<typeof ErrorBoundary> = {
	title: "Shared/ErrorBoundary",
	component: ErrorBoundary,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

/** Component that throws an error on demand */
function BuggyCounter() {
	const [count, setCount] = useState(0);

	if (count >= 3) {
		throw new Error("Counter crashed: exceeded maximum value of 2");
	}

	return (
		<div className="space-y-3 rounded-lg border border-border bg-card p-6">
			<h3 className="text-sm font-medium text-foreground">Buggy Counter</h3>
			<p className="text-sm text-muted-foreground">
				Click the button 3 times to trigger an error.
			</p>
			<div className="flex items-center gap-3">
				<Button
					size="sm"
					onClick={() => setCount((c) => c + 1)}
				>
					Count: {count}
				</Button>
				<span className="text-xs text-muted-foreground">
					(crashes at 3)
				</span>
			</div>
		</div>
	);
}

export const Default: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Click the counter button 3 times to see the error boundary fallback.
				Then click &quot;Try again&quot; to reset.
			</p>
			<ErrorBoundary>
				<BuggyCounter />
			</ErrorBoundary>
		</div>
	),
};

export const WithErrorCallback: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Open the browser console to see the onError callback output.
			</p>
			<ErrorBoundary
				onError={(error, errorInfo) => {
					console.error("ErrorBoundary caught:", error.message);
					console.error("Component stack:", errorInfo.componentStack);
				}}
			>
				<BuggyCounter />
			</ErrorBoundary>
		</div>
	),
};

export const WithCustomFallback: Story = {
	render: () => (
		<ErrorBoundary
			fallback={
				<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
					<p className="text-sm font-medium text-destructive">Custom fallback UI</p>
					<p className="mt-1 text-xs text-muted-foreground">
						This is a custom fallback rendered by the error boundary.
					</p>
				</div>
			}
		>
			<BuggyCounter />
		</ErrorBoundary>
	),
};

export const MultipleChildren: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				The error boundary only catches errors in the buggy component.
				Other siblings outside the boundary are unaffected.
			</p>
			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<h3 className="text-sm font-medium text-foreground">Safe Component</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						This component is outside the error boundary and will not be affected.
					</p>
				</div>
				<ErrorBoundary>
					<BuggyCounter />
				</ErrorBoundary>
			</div>
		</div>
	),
};
