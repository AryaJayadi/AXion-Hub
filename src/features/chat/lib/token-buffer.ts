/**
 * Token buffer hook with requestAnimationFrame-based flush.
 *
 * Accumulates streaming tokens in a ref (not state) and flushes
 * to a callback at screen refresh rate (~60fps), preventing
 * re-render storms during high-frequency token emission from
 * the gateway (30-100+ tokens/second).
 *
 * Uses a ref for the onFlush callback to mitigate stale closure
 * issues in the rAF callback (Pitfall 4 from research).
 */

import { useRef, useEffect, useCallback } from "react";

interface TokenBuffer {
	/** Accumulated tokens since last flush */
	buffer: string;
	/** Active rAF handle for cancellation */
	rafId: number | null;
	/** Whether a flush is scheduled */
	pending: boolean;
}

/**
 * Hook that buffers incoming tokens and flushes to a callback
 * at requestAnimationFrame rate (~60fps = ~16ms intervals).
 *
 * @param onFlush - Called with accumulated tokens at rAF rate
 * @returns appendToken function to feed individual tokens
 *
 * @example
 * ```ts
 * const appendToken = useTokenBuffer((flushed) => {
 *   useChatStore.getState().appendToStream(laneKey, flushed);
 * });
 *
 * eventBus.on('chat.stream.token', ({ token }) => appendToken(token));
 * ```
 */
export function useTokenBuffer(
	onFlush: (tokens: string) => void,
): (token: string) => void {
	const bufferRef = useRef<TokenBuffer>({
		buffer: "",
		rafId: null,
		pending: false,
	});

	// Stale closure mitigation: always call the latest onFlush
	const onFlushRef = useRef(onFlush);
	onFlushRef.current = onFlush;

	// Cleanup on unmount -- cancel any pending rAF
	useEffect(() => {
		return () => {
			if (bufferRef.current.rafId !== null) {
				cancelAnimationFrame(bufferRef.current.rafId);
			}
		};
	}, []);

	const appendToken = useCallback((token: string) => {
		bufferRef.current.buffer += token;

		if (!bufferRef.current.pending) {
			bufferRef.current.pending = true;
			bufferRef.current.rafId = requestAnimationFrame(() => {
				const flushed = bufferRef.current.buffer;
				bufferRef.current.buffer = "";
				bufferRef.current.pending = false;
				bufferRef.current.rafId = null;
				onFlushRef.current(flushed);
			});
		}
	}, []);

	return appendToken;
}
