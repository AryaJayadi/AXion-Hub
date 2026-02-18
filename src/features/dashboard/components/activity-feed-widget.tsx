"use client";

import { useEffect, useRef } from "react";
import { Activity, ChevronUp } from "lucide-react";
import { useActivityStore } from "@/features/dashboard";
import { useAutoScroll } from "@/features/dashboard/lib/use-auto-scroll";
import { ActivityEventCard } from "@/features/dashboard/components/activity-event-card";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

/**
 * Live activity feed widget for the dashboard bento grid.
 *
 * Displays the last 20 events in real time. When the user scrolls down,
 * a floating "N new events" pill appears instead of disrupting scroll position.
 */
export function ActivityFeedWidget() {
	const events = useActivityStore((s) => s.events);
	const containerRef = useRef<HTMLDivElement>(null);
	const { isAtTop, newEventCount, handleScroll, scrollToTop, onNewEvent } =
		useAutoScroll(containerRef);
	const prevLengthRef = useRef(events.length);

	// Notify auto-scroll hook when new events arrive
	useEffect(() => {
		if (events.length > prevLengthRef.current) {
			const newCount = events.length - prevLengthRef.current;
			for (let i = 0; i < newCount; i++) {
				onNewEvent();
			}
		}
		prevLengthRef.current = events.length;
	}, [events.length, onNewEvent]);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center gap-2 px-1 pb-3">
				<Activity className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold">Activity Feed</h3>
				{/* Live indicator dot */}
				<span className="relative flex size-2">
					<span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
					<span className="relative inline-flex size-2 rounded-full bg-green-500" />
				</span>
			</div>

			{/* Feed content */}
			<div className="relative flex-1 overflow-hidden">
				{events.length === 0 ? (
					<EmptyState
						icon={
							<Activity className="size-10 text-muted-foreground/40" />
						}
						title="No activity yet"
						description="Events from your agents will appear here in real time."
						className="py-10"
					/>
				) : (
					<ScrollArea className="h-[420px]">
						<div
							ref={containerRef}
							onScroll={handleScroll}
							className="flex h-[420px] flex-col gap-1.5 overflow-y-auto pr-2"
						>
							{events.map((event) => (
								<ActivityEventCard key={event.id} event={event} />
							))}
						</div>
					</ScrollArea>
				)}

				{/* New events pill */}
				{newEventCount > 0 && !isAtTop && (
					<div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
						<Button
							size="sm"
							variant="secondary"
							onClick={scrollToTop}
							className={cn(
								"gap-1.5 rounded-full shadow-md",
								"animate-in fade-in slide-in-from-top-2 duration-200",
							)}
						>
							<ChevronUp className="size-3.5" />
							{newEventCount} new event{newEventCount !== 1 ? "s" : ""}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
