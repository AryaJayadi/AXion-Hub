"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { GatewayProvider } from "./gateway-provider";

/**
 * App-level provider composition.
 *
 * Order matters:
 * - ThemeProvider (outermost -- theme needed by all)
 * - QueryProvider (TanStack Query client for REST data fetching)
 * - GatewayProvider (WebSocket stack for real-time communication)
 */
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<QueryProvider>
				<GatewayProvider>
					{children}
					<Toaster richColors position="bottom-right" />
				</GatewayProvider>
			</QueryProvider>
		</ThemeProvider>
	);
}
