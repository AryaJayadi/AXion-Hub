import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Provider Detail | AXion Hub",
};

export default async function ProviderDetailPage({
	params,
}: {
	params: Promise<{ provider: string }>;
}) {
	const { provider } = await params;
	return (
		<div className="space-y-6">
			<PageHeader
				title={`Provider: ${provider}`}
				description="Provider configuration and available models"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: provider },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-05</p>
		</div>
	);
}
