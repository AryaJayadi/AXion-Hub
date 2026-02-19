"use client";

import { PageHeader } from "@/shared/ui/page-header";
import { PluginBrowser } from "@/features/plugins/components/plugin-browser";

export function PluginInstallView() {
	return (
		<div>
			<PageHeader
				title="Install Plugin"
				description="Browse and install plugins from the registry"
				breadcrumbs={[
					{ label: "Plugins", href: "/plugins" },
					{ label: "Install" },
				]}
			/>
			<PluginBrowser />
		</div>
	);
}
