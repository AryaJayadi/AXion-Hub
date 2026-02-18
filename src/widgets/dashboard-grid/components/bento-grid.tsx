"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

// ---------------------------------------------------------------------------
// BentoGrid
// ---------------------------------------------------------------------------

interface BentoGridProps {
	children: React.ReactNode;
	className?: string | undefined;
}

/**
 * Responsive bento grid layout for dashboard widgets.
 *
 * - Single column on mobile
 * - 2 columns on md breakpoint
 * - 4 columns on lg breakpoint
 *
 * Callers control widget size via col-span/row-span classes on BentoGridItem.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]",
				className,
			)}
		>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// BentoGridItem
// ---------------------------------------------------------------------------

interface BentoGridItemProps {
	/** Custom grid span classes (e.g., "lg:col-span-2 lg:row-span-2") */
	className?: string | undefined;
	/** Widget title */
	title: string;
	/** Optional subtitle / description */
	description?: string | undefined;
	/** Lucide icon component */
	icon?: LucideIcon | undefined;
	/** Widget body content */
	children: React.ReactNode;
	/** Show stale-data indicator when gateway is disconnected */
	isStale?: boolean | undefined;
}

/**
 * Individual bento grid widget card.
 *
 * When `isStale` is true, the card renders with reduced opacity and a
 * dashed border to indicate the data may be outdated.
 */
export function BentoGridItem({
	className,
	title,
	description,
	icon: Icon,
	children,
	isStale = false,
}: BentoGridItemProps) {
	return (
		<Card
			className={cn(
				"relative overflow-hidden transition-opacity",
				isStale && "opacity-60 border-dashed",
				className,
			)}
		>
			<CardHeader>
				<div className="flex items-center gap-2">
					{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
					<CardTitle className="text-sm">{title}</CardTitle>
				</div>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
