import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface PageHeaderProps {
	/** Page title */
	title: string;
	/** Page description */
	description?: string;
	/** Right-aligned action buttons */
	actions?: ReactNode;
	/** Breadcrumb navigation items */
	breadcrumbs?: BreadcrumbItem[];
	/** Additional class names */
	className?: string;
}

function PageHeader({
	title,
	description,
	actions,
	breadcrumbs,
	className,
}: PageHeaderProps) {
	return (
		<div
			data-slot="page-header"
			className={cn("pb-8", className)}
		>
			{/* Breadcrumbs */}
			{breadcrumbs && breadcrumbs.length > 0 && (
				<nav
					aria-label="Breadcrumb"
					className="mb-3"
				>
					<ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
						{breadcrumbs.map((item, index) => (
							<li key={item.label} className="flex items-center gap-1.5">
								{index > 0 && (
									<span className="text-muted-foreground/50" aria-hidden="true">/</span>
								)}
								{item.href ? (
									<a
										href={item.href}
										className="transition-colors hover:text-foreground"
									>
										{item.label}
									</a>
								) : (
									<span
										className={
											index === breadcrumbs.length - 1
												? "text-foreground font-medium"
												: ""
										}
										aria-current={
											index === breadcrumbs.length - 1 ? "page" : undefined
										}
									>
										{item.label}
									</span>
								)}
							</li>
						))}
					</ol>
				</nav>
			)}

			{/* Title row */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1.5">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{title}
					</h1>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>

				{/* Actions */}
				{actions && (
					<div className="flex shrink-0 items-center gap-2">{actions}</div>
				)}
			</div>
		</div>
	);
}

export { PageHeader };
export type { PageHeaderProps, BreadcrumbItem };
