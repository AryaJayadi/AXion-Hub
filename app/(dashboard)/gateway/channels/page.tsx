import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Gateway Channels | AXion Hub",
};

export default function GatewayChannelsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Channels"
				description="Channels connected through this gateway"
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-04</p>
		</div>
	);
}
