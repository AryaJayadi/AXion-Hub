import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Channel Pairing | AXion Hub",
};

export default function ChannelPairingPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Channel Pairing"
				description="Pair new messaging channels via QR code or connection flow"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: "Pairing" },
				]}
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-04</p>
		</div>
	);
}
