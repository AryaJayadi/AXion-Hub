"use client";

import Link from "next/link";
import { BookOpen, GitBranch, BarChart3 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";

import { useProviders } from "@/features/models/api/use-providers";
import { ProviderCard } from "@/features/models/components/provider-card";

const SUB_NAV = [
	{ label: "Catalog", href: "/models/catalog", icon: BookOpen },
	{ label: "Failover", href: "/models/failover", icon: GitBranch },
	{ label: "Usage", href: "/models/usage", icon: BarChart3 },
] as const;

export function ModelsOverviewView() {
	const { data: providers, isLoading } = useProviders();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Model Providers"
				description="Manage LLM provider connections and configurations"
			/>

			{/* Sub-navigation pills */}
			<div className="flex items-center gap-2">
				{SUB_NAV.map((item) => (
					<Button key={item.href} variant="outline" size="sm" asChild>
						<Link href={item.href}>
							<item.icon className="mr-1.5 size-3.5" />
							{item.label}
						</Link>
					</Button>
				))}
			</div>

			{/* Provider grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			) : !providers || providers.length === 0 ? (
				<EmptyState
					title="No providers configured"
					description="Add a model provider to get started with AI model management."
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{providers.map((provider) => (
						<ProviderCard key={provider.id} provider={provider} />
					))}
				</div>
			)}
		</div>
	);
}
