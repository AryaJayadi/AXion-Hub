"use client";

import { PageHeader } from "@/shared/ui/page-header";

import { ModelCatalogBrowser } from "@/features/models/components/model-catalog-browser";

export function ModelCatalogView() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Model Catalog"
				description="Browse all available models across providers"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Catalog" },
				]}
			/>
			<ModelCatalogBrowser />
		</div>
	);
}
