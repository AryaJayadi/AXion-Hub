"use client";

import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";

import { useProvider } from "@/features/models/api/use-providers";
import { ProviderConfigForm } from "@/features/models/components/provider-config-form";

function formatContextWindow(tokens: number): string {
	if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
	return `${(tokens / 1000).toFixed(0)}K`;
}

interface ProviderDetailViewProps {
	providerSlug: string;
}

export function ProviderDetailView({ providerSlug }: ProviderDetailViewProps) {
	const { data: provider, isLoading } = useProvider(providerSlug);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<SkeletonDetail />
			</div>
		);
	}

	if (!provider) {
		return (
			<EmptyState
				title="Provider not found"
				description={`No provider with slug "${providerSlug}" was found.`}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={provider.name}
				description={`Configure ${provider.name} provider settings`}
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: provider.name },
				]}
				actions={
					<StatusBadge status={provider.status} size="lg" />
				}
			/>

			{/* Config form */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Configuration</h2>
				</CardHeader>
				<CardContent>
					<ProviderConfigForm provider={provider} />
				</CardContent>
			</Card>

			{/* Model list */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Available Models</h2>
						<Badge variant="secondary">
							{provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="pb-2 font-medium">Model</th>
									<th className="pb-2 font-medium">Context</th>
									<th className="pb-2 font-medium">Max Output</th>
									<th className="pb-2 font-medium">Input Price</th>
									<th className="pb-2 font-medium">Output Price</th>
									<th className="pb-2 font-medium">Capabilities</th>
								</tr>
							</thead>
							<tbody>
								{provider.models.map((model) => (
									<tr
										key={model.id}
										className="border-b last:border-0"
									>
										<td className="py-2.5 font-medium">{model.name}</td>
										<td className="py-2.5 text-muted-foreground">
											{formatContextWindow(model.contextWindow)}
										</td>
										<td className="py-2.5 text-muted-foreground">
											{formatContextWindow(model.maxOutputTokens)}
										</td>
										<td className="py-2.5 text-muted-foreground">
											{model.inputPricePerMTok === 0
												? "Free"
												: `$${model.inputPricePerMTok}/MTok`}
										</td>
										<td className="py-2.5 text-muted-foreground">
											{model.outputPricePerMTok === 0
												? "Free"
												: `$${model.outputPricePerMTok}/MTok`}
										</td>
										<td className="py-2.5">
											<div className="flex items-center gap-1 flex-wrap">
												{model.capabilities.map((cap) => (
													<Badge
														key={cap}
														variant="outline"
														className="text-[10px] px-1.5 py-0"
													>
														{cap}
													</Badge>
												))}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
