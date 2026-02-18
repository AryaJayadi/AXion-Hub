import { ProviderDetailView } from "@/views/models/provider-detail-view";

export const metadata = {
	title: "Provider Detail | AXion Hub",
};

export default async function ProviderDetailPage({
	params,
}: {
	params: Promise<{ provider: string }>;
}) {
	const { provider } = await params;
	return <ProviderDetailView providerSlug={provider} />;
}
