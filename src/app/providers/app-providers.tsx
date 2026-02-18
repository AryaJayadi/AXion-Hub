"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { GatewayProvider } from "./gateway-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

/**
 * App-level provider composition.
 *
 * Order matters:
 * - ThemeProvider (outermost -- theme needed by all)
 * - NuqsAdapter (URL search param state for nuqs hooks)
 * - QueryProvider (TanStack Query client for REST data fetching)
 * - GatewayProvider (WebSocket stack for real-time communication)
 */
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<NuqsAdapter>
				<QueryProvider>
					<GatewayProvider>
						{children}
						<Toaster richColors position="bottom-right" />
					</GatewayProvider>
				</QueryProvider>
			</NuqsAdapter>
		</ThemeProvider>
	);
}
