import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Channels | AXion Hub",
};

export default function ChannelsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Channels"
				description="Manage messaging channels and platform connections"
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-04</p>
		</div>
	);
}
