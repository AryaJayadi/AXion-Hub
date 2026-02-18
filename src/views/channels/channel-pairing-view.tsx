"use client";

import { PageHeader } from "@/shared/ui/page-header";
import { PairingWizard } from "@/features/channels/components/pairing-wizard";

export function ChannelPairingView() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Pair New Channel"
				description="Connect a messaging platform to your gateway"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: "Pair New Channel" },
				]}
			/>
			<PairingWizard />
		</div>
	);
}
