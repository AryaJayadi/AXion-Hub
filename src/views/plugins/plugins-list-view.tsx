"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { PluginTable } from "@/features/plugins/components/plugin-table";
import { usePlugins } from "@/features/plugins/api/use-plugins";

export function PluginsListView() {
	const { data: plugins, isLoading } = usePlugins();

	return (
		<div>
			<PageHeader
				title="Plugins"
				description="Manage workspace-wide plugin integrations"
				actions={
					<Button asChild size="sm">
						<Link href="/plugins/install">
							<Plus className="size-4" />
							Install Plugin
						</Link>
					</Button>
				}
			/>
			<PluginTable
				plugins={plugins ?? []}
				{...(isLoading ? { isLoading: true } : {})}
			/>
		</div>
	);
}
