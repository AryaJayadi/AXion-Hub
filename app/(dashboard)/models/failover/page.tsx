import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Failover Chains | AXion Hub",
};

export default function ModelFailoverPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Failover Chains"
				description="Configure model failover and retry strategies"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Failover" },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-05</p>
		</div>
	);
}
