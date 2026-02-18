"use client";

import { PageHeader } from "@/shared/ui/page-header";

import { FailoverChainBuilder } from "@/features/models/components/failover-chain-builder";

export function FailoverView() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Failover Chains"
				description="Configure model failover priority for resilient AI operations"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Failover" },
				]}
			/>
			<FailoverChainBuilder />
		</div>
	);
}
