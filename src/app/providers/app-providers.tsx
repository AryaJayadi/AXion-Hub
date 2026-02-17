"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<QueryProvider>
				{children}
				<Toaster richColors position="bottom-right" />
			</QueryProvider>
		</ThemeProvider>
	);
}
