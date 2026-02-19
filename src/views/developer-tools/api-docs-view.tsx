"use client";

import { ScalarApiReference } from "@/features/developer-tools/components/scalar-api-reference";

export function ApiDocsView() {
	return (
		<div className="min-h-[calc(100vh-4rem)] -m-4 md:-m-6">
			<ScalarApiReference />
		</div>
	);
}
