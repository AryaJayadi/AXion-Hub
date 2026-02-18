"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

import type { ModelProvider } from "@/entities/model-provider/model/types";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { SearchInput } from "@/shared/ui/search-input";
import { StatusBadge } from "@/shared/ui/status-badge";

import { useProviders } from "../api/use-providers";

function formatContextWindow(tokens: number): string {
	if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
	return `${(tokens / 1000).toFixed(0)}K`;
}

export function ModelCatalogBrowser() {
	const { data: providers, isLoading } = useProviders();
	const [search, setSearch] = useState("");

	const filteredProviders = useMemo(() => {
		if (!providers) return [];
		if (!search.trim()) return providers;

		const lower = search.toLowerCase();
		return providers
			.map((provider) => ({
				...provider,
				models: provider.models.filter((model) =>
					model.name.toLowerCase().includes(lower),
				),
			}))
			.filter((provider) => provider.models.length > 0);
	}, [providers, search]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 w-full rounded-md bg-muted animate-pulse" />
				<div className="h-40 w-full rounded-md bg-muted animate-pulse" />
				<div className="h-40 w-full rounded-md bg-muted animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<SearchInput
				value={search}
				onChange={setSearch}
				placeholder="Search models by name..."
			/>

			{filteredProviders.length === 0 ? (
				<div className="flex flex-col items-center py-12 text-center">
					<p className="text-sm text-muted-foreground">
						{search
							? "No models match your search"
							: "No models available"}
					</p>
				</div>
			) : (
				filteredProviders.map((provider) => (
					<ProviderModelSection
						key={provider.id}
						provider={provider}
						defaultOpen={provider.status === "connected"}
					/>
				))
			)}
		</div>
	);
}

function ProviderModelSection({
	provider,
	defaultOpen,
}: {
	provider: ModelProvider;
	defaultOpen: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card>
				<CollapsibleTrigger className="w-full text-left">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h3 className="text-base font-semibold">{provider.name}</h3>
								<StatusBadge status={provider.status} size="sm" />
								<Badge variant="secondary" className="text-xs">
									{provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
								</Badge>
							</div>
							<ChevronDown
								className={cn(
									"size-4 text-muted-foreground transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</div>
					</CardHeader>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<CardContent className="pt-0">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{provider.models.map((model) => (
								<div
									key={model.id}
									className="rounded-lg border bg-muted/30 p-3 space-y-2"
								>
									<div className="flex items-center justify-between">
										<h4 className="text-sm font-medium">{model.name}</h4>
									</div>

									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<span>
											{formatContextWindow(model.contextWindow)} context
										</span>
										<span>
											{formatContextWindow(model.maxOutputTokens)} output
										</span>
									</div>

									<div className="text-xs text-muted-foreground">
										{model.inputPricePerMTok === 0 &&
										model.outputPricePerMTok === 0 ? (
											<span>Free (local)</span>
										) : (
											<span>
												${model.inputPricePerMTok}/${model.outputPricePerMTok}{" "}
												per MTok
											</span>
										)}
									</div>

									{model.capabilities.length > 0 && (
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
									)}
								</div>
							))}
						</div>
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
