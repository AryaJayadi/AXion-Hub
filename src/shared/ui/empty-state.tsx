import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

/** Default line-art illustration -- a geometric hexagonal node with connection lines */
function DefaultIllustration({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 120 120"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("size-16 text-muted-foreground/40", className)}
			aria-hidden="true"
		>
			{/* Central hexagon */}
			<path
				d="M60 25L85 38.5V65.5L60 79L35 65.5V38.5L60 25Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Inner circle */}
			<circle
				cx="60"
				cy="52"
				r="10"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			{/* Connection lines radiating outward */}
			<line
				x1="35"
				y1="38.5"
				x2="18"
				y2="28"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				opacity="0.5"
			/>
			<line
				x1="85"
				y1="38.5"
				x2="102"
				y2="28"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				opacity="0.5"
			/>
			<line
				x1="60"
				y1="79"
				x2="60"
				y2="100"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				opacity="0.5"
			/>
			{/* Node dots at line ends */}
			<circle cx="18" cy="28" r="3" fill="currentColor" opacity="0.3" />
			<circle cx="102" cy="28" r="3" fill="currentColor" opacity="0.3" />
			<circle cx="60" cy="100" r="3" fill="currentColor" opacity="0.3" />
			{/* Accent highlight on center */}
			<circle
				cx="60"
				cy="52"
				r="3"
				className="fill-primary/40"
			/>
		</svg>
	);
}

interface EmptyStateProps {
	/** Custom icon or illustration (replaces default) */
	icon?: ReactNode;
	/** Title text */
	title: string;
	/** Description text */
	description: string;
	/** Call-to-action button */
	action?: {
		label: string;
		onClick: () => void;
	};
	/** Additional class names */
	className?: string;
}

function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"flex flex-col items-center justify-center px-6 py-16 text-center",
				className,
			)}
		>
			{/* Icon / Illustration */}
			<div className="mb-4">
				{icon ?? <DefaultIllustration />}
			</div>

			{/* Title */}
			<h3 className="text-lg font-semibold text-foreground">{title}</h3>

			{/* Description */}
			<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
				{description}
			</p>

			{/* CTA Button */}
			{action && (
				<Button onClick={action.onClick} className="mt-6" size="sm">
					{action.label}
				</Button>
			)}
		</div>
	);
}

export { EmptyState, DefaultIllustration };
export type { EmptyStateProps };
