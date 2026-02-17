"use client";

import { X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

type FilterConfig =
	| {
			key: string;
			label: string;
			type: "select";
			options: Array<{ label: string; value: string }>;
	  }
	| {
			key: string;
			label: string;
			type: "multi-select";
			options: Array<{ label: string; value: string }>;
	  }
	| {
			key: string;
			label: string;
			type: "text";
	  }
	| {
			key: string;
			label: string;
			type: "date-range";
	  };

interface FilterBarProps {
	/** Filter configurations */
	filters: FilterConfig[];
	/** Current filter values */
	values: Record<string, unknown>;
	/** Called when a filter value changes */
	onChange: (key: string, value: unknown) => void;
	/** Called when all filters are cleared */
	onClear: () => void;
	/** Additional class names */
	className?: string;
}

function FilterBar({
	filters,
	values,
	onChange,
	onClear,
	className,
}: FilterBarProps) {
	const activeFilterCount = Object.values(values).filter(
		(v) => v !== undefined && v !== null && v !== "",
	).length;

	return (
		<div data-slot="filter-bar" className={cn("space-y-3", className)}>
			{/* Filter controls row */}
			<div className="flex flex-wrap items-center gap-3">
				{filters.map((filter) => (
					<FilterControl
						key={filter.key}
						filter={filter}
						value={values[filter.key]}
						onChange={(value) => onChange(filter.key, value)}
					/>
				))}

				{/* Clear all button */}
				{activeFilterCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClear}
						className="text-muted-foreground hover:text-foreground"
					>
						Clear all
						<X className="ml-1 size-3" />
					</Button>
				)}
			</div>

			{/* Active filter badges */}
			{activeFilterCount > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs text-muted-foreground">Active filters:</span>
					{filters.map((filter) => {
						const value = values[filter.key];
						if (value === undefined || value === null || value === "")
							return null;

						const displayValue = getFilterDisplayValue(filter, value);
						if (!displayValue) return null;

						return (
							<Badge
								key={filter.key}
								variant="secondary"
								className="gap-1 pl-2 pr-1"
							>
								<span className="text-xs">
									{filter.label}: {displayValue}
								</span>
								<button
									type="button"
									onClick={() => onChange(filter.key, undefined)}
									className="ml-0.5 rounded-full p-0.5 hover:bg-secondary-foreground/20"
									aria-label={`Remove ${filter.label} filter`}
								>
									<X className="size-3" />
								</button>
							</Badge>
						);
					})}
				</div>
			)}
		</div>
	);
}

/** Render the appropriate control for a filter type */
function FilterControl({
	filter,
	value,
	onChange,
}: {
	filter: FilterConfig;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	switch (filter.type) {
		case "select":
			return (
				<Select
					value={(value as string) ?? ""}
					onValueChange={(v) => onChange(v || undefined)}
				>
					<SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
						<SelectValue placeholder={filter.label} />
					</SelectTrigger>
					<SelectContent>
						{filter.options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);

		case "multi-select": {
			const selectedValues = (value as string[]) ?? [];
			return (
				<div className="flex flex-wrap items-center gap-1">
					<Select
						value=""
						onValueChange={(v) => {
							if (!selectedValues.includes(v)) {
								onChange([...selectedValues, v]);
							}
						}}
					>
						<SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
							<SelectValue
								placeholder={
									selectedValues.length > 0
										? `${filter.label} (${selectedValues.length.toString()})`
										: filter.label
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{filter.options
								.filter((o) => !selectedValues.includes(o.value))
								.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
					{selectedValues.map((v) => {
						const option = filter.options.find((o) => o.value === v);
						return (
							<Badge key={v} variant="outline" className="gap-1 px-1.5 py-0 text-xs">
								{option?.label ?? v}
								<button
									type="button"
									onClick={() =>
										onChange(selectedValues.filter((sv) => sv !== v))
									}
									className="rounded-full p-0.5 hover:bg-accent"
									aria-label={`Remove ${option?.label ?? v}`}
								>
									<X className="size-2.5" />
								</button>
							</Badge>
						);
					})}
				</div>
			);
		}

		case "text":
			return (
				<Input
					placeholder={filter.label}
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value || undefined)}
					className="h-8 w-auto min-w-[140px] text-xs"
				/>
			);

		case "date-range":
			// Date range is a placeholder -- full implementation would use a date picker
			return (
				<Input
					type="date"
					placeholder={filter.label}
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value || undefined)}
					className="h-8 w-auto text-xs"
				/>
			);
	}
}

/** Get human-readable display value for a filter */
function getFilterDisplayValue(
	filter: FilterConfig,
	value: unknown,
): string | null {
	if (value === undefined || value === null || value === "") return null;

	switch (filter.type) {
		case "select": {
			const option = filter.options.find((o) => o.value === value);
			return option?.label ?? String(value);
		}
		case "multi-select": {
			const values = value as string[];
			if (values.length === 0) return null;
			return values
				.map((v) => filter.options.find((o) => o.value === v)?.label ?? v)
				.join(", ");
		}
		case "text":
			return String(value);
		case "date-range":
			return String(value);
	}
}

export { FilterBar };
export type { FilterBarProps, FilterConfig };
