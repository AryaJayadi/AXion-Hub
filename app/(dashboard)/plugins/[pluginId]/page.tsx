import { PluginDetailView } from "@/views/plugins/plugin-detail-view";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ pluginId: string }>;
}) {
	const { pluginId } = await params;
	return {
		title: `Plugin ${pluginId} | AXion Hub`,
	};
}

export default async function PluginDetailPage({
	params,
}: {
	params: Promise<{ pluginId: string }>;
}) {
	const { pluginId } = await params;
	return <PluginDetailView pluginId={pluginId} />;
}
