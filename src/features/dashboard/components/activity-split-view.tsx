"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useActivityStore } from "@/features/dashboard";
import { ActivityEventCard } from "./activity-event-card";
import { ActivityEventDetail } from "./activity-event-detail";
import { SearchInput } from "@/shared/ui/search-input";
import { FilterBar, type FilterConfig } from "@/shared/ui/filter-bar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useAutoScroll } from "@/features/dashboard/lib/use-auto-scroll";
import { Button } from "@/shared/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { DashboardEvent } from "@/entities/dashboard-event";

const EVENT_TYPE_OPTIONS = [
	{ label: "Agent", value: "agent" },
	{ label: "Chat", value: "chat" },
	{ label: "Execution", value: "exec" },
	{ label: "System", value: "ws" },
];

const SEVERITY_OPTIONS = [
	{ label: "Info", value: "info" },
	{ label: "Warning", value: "warning" },
	{ label: "Error", value: "error" },
];

const SOURCE_OPTIONS = [
	{ label: "Gateway", value: "gateway" },
	{ label: "Provider", value: "provider" },
	{ label: "Channel", value: "channel" },
	{ label: "Node", value: "node" },
];

const FILTER_CONFIGS: FilterConfig[] = [
	{
		key: "types",
		label: "Event Type",
		type: "multi-select",
		options: EVENT_TYPE_OPTIONS,
	},
	{
		key: "severity",
		label: "Severity",
		type: "multi-select",
		options: SEVERITY_OPTIONS,
	},
	{
		key: "source",
		label: "Source",
		type: "multi-select",
		options: SOURCE_OPTIONS,
	},
];

export function ActivitySplitView() {
	const fullEvents = useActivityStore((s) => s.fullEvents);
	const [selectedEvent, setSelectedEvent] = useState<DashboardEvent | null>(null);

	// URL-persisted filters via nuqs
	const [search, setSearch] = useQueryState("q", { defaultValue: "" });
	const [typesFilter, setTypesFilter] = useQueryState("types", { defaultValue: "" });
	const [severityFilter, setSeverityFilter] = useQueryState("severity", { defaultValue: "" });
	const [sourceFilter, setSourceFilter] = useQueryState("source", { defaultValue: "" });

	// Parse comma-separated URL values to arrays
	const filterValues: Record<string, unknown> = useMemo(() => ({
		types: typesFilter ? typesFilter.split(",") : undefined,
		severity: severityFilter ? severityFilter.split(",") : undefined,
		source: sourceFilter ? sourceFilter.split(",") : undefined,
	}), [typesFilter, severityFilter, sourceFilter]);

	const handleFilterChange = useCallback(
		(key: string, value: unknown) => {
			const arr = value as string[] | undefined;
			const serialized = arr && arr.length > 0 ? arr.join(",") : null;
			switch (key) {
				case "types":
					void setTypesFilter(serialized);
					break;
				case "severity":
					void setSeverityFilter(serialized);
					break;
				case "source":
					void setSourceFilter(serialized);
					break;
			}
		},
		[setTypesFilter, setSeverityFilter, setSourceFilter],
	);

	const handleClearFilters = useCallback(() => {
		void setTypesFilter(null);
		void setSeverityFilter(null);
		void setSourceFilter(null);
	}, [setTypesFilter, setSeverityFilter, setSourceFilter]);

	// Filter events
	const filteredEvents = useMemo(() => {
		return fullEvents.filter((event) => {
			// Text search
			if (search) {
				const q = search.toLowerCase();
				const matchesText =
					event.summary.toLowerCase().includes(q) ||
					event.type.toLowerCase().includes(q) ||
					event.source.toLowerCase().includes(q) ||
					(event.agentId?.toLowerCase().includes(q) ?? false);
				if (!matchesText) return false;
			}

			// Type filter
			const types = filterValues.types as string[] | undefined;
			if (types && types.length > 0) {
				const prefix = event.type.split(".")[0];
				if (!types.includes(prefix ?? "")) return false;
			}

			// Severity filter
			const severities = filterValues.severity as string[] | undefined;
			if (severities && severities.length > 0) {
				if (!severities.includes(event.severity)) return false;
			}

			// Source filter
			const sources = filterValues.source as string[] | undefined;
			if (sources && sources.length > 0) {
				if (!sources.includes(event.source.toLowerCase())) return false;
			}

			return true;
		});
	}, [fullEvents, search, filterValues]);

	// Auto-scroll for the event list
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { isAtTop, newEventCount, handleScroll, scrollToTop } =
		useAutoScroll(scrollContainerRef);

	return (
		<div className="flex flex-col gap-4 md:flex-row md:gap-6">
			{/* Left panel -- event list (60%) */}
			<div className="flex w-full flex-col gap-3 md:w-3/5">
				<SearchInput
					value={search}
					onChange={setSearch}
					placeholder="Search events..."
					className="max-w-sm"
				/>

				<FilterBar
					filters={FILTER_CONFIGS}
					values={filterValues}
					onChange={handleFilterChange}
					onClear={handleClearFilters}
				/>

				{/* Scrollable event list */}
				<div className="relative">
					{/* New events indicator */}
					{!isAtTop && newEventCount > 0 && (
						<div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
							<Button
								size="sm"
								variant="secondary"
								onClick={scrollToTop}
								className="shadow-md"
							>
								<ArrowUp className="mr-1 size-3" />
								{newEventCount} new event{newEventCount !== 1 ? "s" : ""}
							</Button>
						</div>
					)}

					<ScrollArea className="h-[600px]">
						<div
							ref={scrollContainerRef}
							onScroll={handleScroll}
							className="space-y-1 pr-2"
						>
							{filteredEvents.length === 0 ? (
								<p className="py-12 text-center text-sm text-muted-foreground">
									No events to display
								</p>
							) : (
								filteredEvents.map((event) => (
									<button
										key={event.id}
										type="button"
										onClick={() => setSelectedEvent(event)}
										className={cn(
											"w-full rounded-md text-left transition-colors",
											selectedEvent?.id === event.id && "bg-accent",
										)}
									>
										<ActivityEventCard event={event} />
									</button>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			</div>

			{/* Right panel -- event detail (40%) */}
			<div className="w-full md:w-2/5">
				<div className="sticky top-4">
					<ActivityEventDetail event={selectedEvent} />
				</div>
			</div>
		</div>
	);
}
