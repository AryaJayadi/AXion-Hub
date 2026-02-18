import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Model Catalog | AXion Hub",
};

export default function ModelCatalogPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Model Catalog"
				description="Browse all available AI models across providers"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Catalog" },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-05</p>
		</div>
	);
}
