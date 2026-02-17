import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

/**
 * Status-to-variant mapping for semantic status labels.
 * Maps various status strings to internal variant names.
 */
const statusVariantMap: Record<string, StatusVariant> = {
	online: "success",
	connected: "success",
	active: "success",
	idle: "muted",
	standby: "muted",
	working: "working",
	running: "working",
	"in-progress": "working",
	error: "destructive",
	failed: "destructive",
	offline: "destructive",
	warning: "warning",
	degraded: "warning",
	unknown: "neutral",
	pending: "neutral",
};

type StatusVariant =
	| "success"
	| "muted"
	| "working"
	| "destructive"
	| "warning"
	| "neutral";

const statusBadgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
	{
		variants: {
			variant: {
				success:
					"border-secondary/30 bg-secondary/10 text-secondary dark:border-secondary/40 dark:bg-secondary/15 dark:text-secondary",
				muted:
					"border-border bg-muted/50 text-muted-foreground dark:border-border dark:bg-muted/30",
				working:
					"border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary",
				destructive:
					"border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/15",
				warning:
					"border-warning/30 bg-warning/10 text-warning dark:border-warning/40 dark:bg-warning/15 dark:text-warning-foreground",
				neutral:
					"border-border bg-muted/30 text-muted-foreground dark:border-border dark:bg-muted/20",
			},
			size: {
				sm: "px-2 py-0.5 text-xs",
				md: "px-2.5 py-0.5 text-xs",
				lg: "px-3 py-1 text-sm",
			},
		},
		defaultVariants: {
			variant: "neutral",
			size: "md",
		},
	},
);

/** Animated status dot indicator */
function StatusDot({
	variant,
	size,
}: {
	variant: StatusVariant;
	size: "sm" | "md" | "lg";
}) {
	const dotSizeClass = size === "sm" ? "size-1.5" : size === "lg" ? "size-2.5" : "size-2";

	const dotColorMap: Record<StatusVariant, string> = {
		success: "bg-secondary",
		muted: "bg-muted-foreground/60",
		working: "bg-primary",
		destructive: "bg-destructive",
		warning: "bg-warning",
		neutral: "bg-muted-foreground/40",
	};

	return (
		<span className="relative inline-flex">
			{variant === "working" && (
				<span
					className={cn(
						"absolute inline-flex rounded-full opacity-75",
						dotSizeClass,
						dotColorMap[variant],
						"animate-ping",
					)}
				/>
			)}
			<span
				className={cn("relative inline-flex rounded-full", dotSizeClass, dotColorMap[variant])}
			/>
		</span>
	);
}

/** Capitalize a status string for display */
function formatStatusLabel(status: string): string {
	return status
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

interface StatusBadgeProps
	extends Omit<VariantProps<typeof statusBadgeVariants>, "variant"> {
	/** The status key. Maps to a semantic color variant. */
	status: string;
	/** Override the display label (defaults to capitalized status) */
	label?: string;
	/** Badge size */
	size?: "sm" | "md" | "lg";
	/** Show an animated dot indicator */
	showDot?: boolean;
	/** Additional class names */
	className?: string;
}

function StatusBadge({
	status,
	label,
	size = "md",
	showDot = true,
	className,
}: StatusBadgeProps) {
	const variant = statusVariantMap[status.toLowerCase()] ?? "neutral";
	const displayLabel = label ?? formatStatusLabel(status);

	return (
		<span
			data-slot="status-badge"
			data-status={status}
			className={cn(statusBadgeVariants({ variant, size }), className)}
		>
			{showDot && <StatusDot variant={variant} size={size} />}
			{displayLabel}
		</span>
	);
}

export { StatusBadge, statusBadgeVariants, statusVariantMap };
export type { StatusBadgeProps, StatusVariant };
