import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Channel Routing | AXion Hub",
};

export default function ChannelRoutingPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Channel Routing"
				description="Configure channel-to-agent routing rules"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: "Routing" },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-04</p>
		</div>
	);
}
