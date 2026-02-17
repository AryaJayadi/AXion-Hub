import type { Meta, StoryObj } from "@storybook/react";

import {
	LoadingSkeleton,
	SkeletonTable,
	SkeletonCard,
	SkeletonList,
	SkeletonDetail,
} from "./loading-skeleton";

const meta: Meta<typeof LoadingSkeleton> = {
	title: "Shared/LoadingSkeleton",
	component: LoadingSkeleton,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof LoadingSkeleton>;

export const Base: Story = {
	render: () => (
		<div className="space-y-4 max-w-md">
			<LoadingSkeleton className="h-4 w-full rounded" />
			<LoadingSkeleton className="h-4 w-3/4 rounded" />
			<LoadingSkeleton className="h-4 w-1/2 rounded" />
			<LoadingSkeleton className="h-10 w-full rounded-md" />
		</div>
	),
};

export const TablePreset: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="mb-3 text-sm font-medium text-foreground">Default (5 rows, 4 columns)</h3>
				<SkeletonTable />
			</div>
			<div>
				<h3 className="mb-3 text-sm font-medium text-foreground">Custom (3 rows, 6 columns)</h3>
				<SkeletonTable rows={3} columns={6} />
			</div>
		</div>
	),
};

export const CardPreset: Story = {
	render: () => (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
		</div>
	),
};

export const ListPreset: Story = {
	render: () => (
		<div className="max-w-lg">
			<SkeletonList items={5} />
		</div>
	),
};

export const DetailPreset: Story = {
	render: () => <SkeletonDetail />,
};

export const AllPresets: Story = {
	render: () => (
		<div className="space-y-10">
			<section>
				<h3 className="mb-4 text-sm font-medium text-foreground">Table Skeleton</h3>
				<SkeletonTable rows={3} columns={4} />
			</section>
			<section>
				<h3 className="mb-4 text-sm font-medium text-foreground">Card Skeleton</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</section>
			<section>
				<h3 className="mb-4 text-sm font-medium text-foreground">List Skeleton</h3>
				<SkeletonList items={3} className="max-w-md" />
			</section>
			<section>
				<h3 className="mb-4 text-sm font-medium text-foreground">Detail Skeleton</h3>
				<SkeletonDetail />
			</section>
		</div>
	),
};
