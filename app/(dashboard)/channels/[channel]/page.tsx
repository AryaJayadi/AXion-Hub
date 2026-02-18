import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Channel Detail | AXion Hub",
};

export default async function ChannelDetailPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	return (
		<div className="space-y-6">
			<PageHeader
				title={`Channel: ${channel}`}
				description="Channel configuration and status"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: channel },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-04</p>
		</div>
	);
}
