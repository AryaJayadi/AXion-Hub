import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Gateway Nodes | AXion Hub",
};

export default function GatewayNodesPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Nodes"
				description="Devices and platforms connected to the gateway"
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-03</p>
		</div>
	);
}
