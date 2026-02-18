"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Scroll-position-aware auto-scroll hook for the activity feed.
 *
 * When the user is near the top of the container, new events appear naturally.
 * When the user has scrolled down to read older events, a "new events" count
 * accumulates and can be used to show an indicator pill.
 */
export function useAutoScroll(
	containerRef: React.RefObject<HTMLElement | null>,
) {
	const [isAtTop, setIsAtTop] = useState(true);
	const [newEventCount, setNewEventCount] = useState(0);
	const prevIsAtTopRef = useRef(true);

	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;

		const atTop = el.scrollTop < 50;
		setIsAtTop(atTop);

		// When user scrolls back to top, reset the new event count
		if (atTop && !prevIsAtTopRef.current) {
			setNewEventCount(0);
		}
		prevIsAtTopRef.current = atTop;
	}, [containerRef]);

	const scrollToTop = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;

		el.scrollTo({ top: 0, behavior: "smooth" });
		setNewEventCount(0);
		setIsAtTop(true);
		prevIsAtTopRef.current = true;
	}, [containerRef]);

	const onNewEvent = useCallback(() => {
		if (!prevIsAtTopRef.current) {
			setNewEventCount((c) => c + 1);
		}
	}, []);

	return {
		isAtTop,
		newEventCount,
		handleScroll,
		scrollToTop,
		onNewEvent,
	} as const;
}
