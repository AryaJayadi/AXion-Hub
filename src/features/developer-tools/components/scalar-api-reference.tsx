"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Scalar accesses browser APIs at import time -- must use dynamic import with ssr: false
const ApiReferenceReact = dynamic(
	() =>
		import("@scalar/api-reference-react").then(
			(mod) => mod.ApiReferenceReact,
		),
	{ ssr: false },
);

export function ScalarApiReference() {
	const { resolvedTheme } = useTheme();

	return (
		<div className="scalar-wrapper isolate">
			<ApiReferenceReact
				configuration={{
					url: "/api/openapi.json",
					darkMode: resolvedTheme === "dark",
					layout: "modern",
					showSidebar: true,
					searchHotKey: "q",
					hideModels: false,
					customCss: `
						.scalar-app {
							--scalar-font: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
							--scalar-font-code: var(--font-jetbrains-mono), ui-monospace, monospace;
						}
					`,
				}}
			/>
		</div>
	);
}
