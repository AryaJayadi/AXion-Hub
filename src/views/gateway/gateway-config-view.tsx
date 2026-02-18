"use client";

import { PageHeader } from "@/shared/ui/page-header";
import { ConfigEditor } from "@/features/gateway/components/config-editor";

/**
 * Gateway configuration editor view.
 * Renders page header and the tabbed config editor with
 * form/JSON toggle and draft-then-apply workflow.
 */
export function GatewayConfigView() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Configuration"
				description="Edit your openclaw.json gateway settings"
				breadcrumbs={[
					{ label: "Gateway", href: "/gateway" },
					{ label: "Configuration" },
				]}
			/>
			<ConfigEditor />
		</div>
	);
}
