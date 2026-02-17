"use client";

import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";

/** Base loading skeleton with shimmer animation */
function LoadingSkeleton({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<Skeleton
			className={cn("bg-muted", className)}
			style={{
				backgroundImage:
					"linear-gradient(90deg, transparent 0%, oklch(0.5 0 0 / 0.08) 50%, transparent 100%)",
				backgroundSize: "200% 100%",
				animation: "shimmer 1.5s ease-in-out infinite, pulse 2s ease-in-out infinite",
			}}
			{...props}
		/>
	);
}

/** Skeleton table with header and body row placeholders */
function SkeletonTable({
	rows = 5,
	columns = 4,
	className,
}: {
	rows?: number;
	columns?: number;
	className?: string;
}) {
	return (
		<div className={cn("w-full space-y-2", className)}>
			{/* Header row */}
			<div className="flex gap-4 px-4 py-3">
				{Array.from({ length: columns }).map((_, i) => (
					<LoadingSkeleton
						key={`header-${i.toString()}`}
						className="h-4 flex-1 rounded"
					/>
				))}
			</div>
			{/* Separator */}
			<div className="border-b border-border" />
			{/* Body rows */}
			{Array.from({ length: rows }).map((_, rowIdx) => (
				<div
					key={`row-${rowIdx.toString()}`}
					className="flex gap-4 px-4 py-3"
				>
					{Array.from({ length: columns }).map((_, colIdx) => (
						<LoadingSkeleton
							key={`cell-${rowIdx.toString()}-${colIdx.toString()}`}
							className="h-4 flex-1 rounded"
						/>
					))}
				</div>
			))}
		</div>
	);
}

/** Skeleton card with title, description, and action placeholders */
function SkeletonCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-card p-6 space-y-4",
				className,
			)}
		>
			{/* Title */}
			<LoadingSkeleton className="h-5 w-2/3 rounded" />
			{/* Description lines */}
			<div className="space-y-2">
				<LoadingSkeleton className="h-3 w-full rounded" />
				<LoadingSkeleton className="h-3 w-4/5 rounded" />
			</div>
			{/* Actions */}
			<div className="flex gap-2 pt-2">
				<LoadingSkeleton className="h-8 w-20 rounded-md" />
				<LoadingSkeleton className="h-8 w-20 rounded-md" />
			</div>
		</div>
	);
}

/** Skeleton list with avatar and text placeholders */
function SkeletonList({
	items = 3,
	className,
}: {
	items?: number;
	className?: string;
}) {
	return (
		<div className={cn("space-y-4", className)}>
			{Array.from({ length: items }).map((_, i) => (
				<div
					key={`list-item-${i.toString()}`}
					className="flex items-center gap-4"
				>
					{/* Avatar circle */}
					<LoadingSkeleton className="h-10 w-10 shrink-0 rounded-full" />
					{/* Text lines */}
					<div className="flex-1 space-y-2">
						<LoadingSkeleton className="h-4 w-1/3 rounded" />
						<LoadingSkeleton className="h-3 w-2/3 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Skeleton detail page with header, sections, and sidebar */
function SkeletonDetail({ className }: { className?: string }) {
	return (
		<div className={cn("flex gap-8", className)}>
			{/* Main content */}
			<div className="flex-1 space-y-6">
				{/* Header */}
				<div className="space-y-3">
					<LoadingSkeleton className="h-7 w-1/2 rounded" />
					<LoadingSkeleton className="h-4 w-3/4 rounded" />
				</div>
				{/* Section 1 */}
				<div className="space-y-3">
					<LoadingSkeleton className="h-5 w-1/4 rounded" />
					<LoadingSkeleton className="h-3 w-full rounded" />
					<LoadingSkeleton className="h-3 w-full rounded" />
					<LoadingSkeleton className="h-3 w-2/3 rounded" />
				</div>
				{/* Section 2 */}
				<div className="space-y-3">
					<LoadingSkeleton className="h-5 w-1/3 rounded" />
					<LoadingSkeleton className="h-24 w-full rounded-lg" />
				</div>
			</div>
			{/* Sidebar */}
			<div className="hidden w-64 shrink-0 space-y-4 lg:block">
				<LoadingSkeleton className="h-5 w-1/2 rounded" />
				<LoadingSkeleton className="h-3 w-full rounded" />
				<LoadingSkeleton className="h-3 w-3/4 rounded" />
				<div className="border-b border-border" />
				<LoadingSkeleton className="h-5 w-1/2 rounded" />
				<LoadingSkeleton className="h-3 w-full rounded" />
			</div>
		</div>
	);
}

export {
	LoadingSkeleton,
	SkeletonTable,
	SkeletonCard,
	SkeletonList,
	SkeletonDetail,
};
