import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Model Usage | AXion Hub",
};

export default function ModelUsagePage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Model Usage"
				description="Track token usage, costs, and request volume by model and provider"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Usage" },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-05</p>
		</div>
	);
}
