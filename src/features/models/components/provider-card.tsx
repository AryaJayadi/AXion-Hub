"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Globe } from "lucide-react";

import type { ModelProvider } from "@/entities/model-provider/model/types";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { StatusBadge } from "@/shared/ui/status-badge";

function formatContextWindow(tokens: number): string {
	if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
	return `${(tokens / 1000).toFixed(0)}K`;
}

function formatPricing(input: number, output: number): string {
	if (input === 0 && output === 0) return "Free (local)";
	return `$${input}/$${output} per MTok`;
}

interface ProviderCardProps {
	provider: ModelProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card className="transition-colors hover:border-primary/30">
			<Link href={`/models/${provider.slug}`} className="block">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<h3 className="text-base font-semibold">{provider.name}</h3>
							<p className="text-xs text-muted-foreground">{provider.slug}</p>
						</div>
						<StatusBadge status={provider.status} size="sm" />
					</div>
				</CardHeader>

				<CardContent className="pb-3">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant="outline" className="text-xs">
							{provider.authMethod === "api_key"
								? "API Key"
								: provider.authMethod === "oauth"
									? "OAuth"
									: "No Auth"}
						</Badge>
						<Badge variant="secondary" className="text-xs">
							{provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
						</Badge>
						{provider.baseUrl && (
							<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
								<Globe className="size-3" />
								{provider.baseUrl}
							</span>
						)}
					</div>
				</CardContent>
			</Link>

			{/* Expandable models section */}
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="px-6">
					<CollapsibleTrigger
						className="flex w-full items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						onClick={(e) => e.stopPropagation()}
					>
						<span>Models ({provider.models.length})</span>
						<ChevronDown
							className={cn(
								"size-4 transition-transform duration-200",
								isOpen && "rotate-180",
							)}
						/>
					</CollapsibleTrigger>
				</div>

				<CollapsibleContent>
					<div className="px-6 pb-3 space-y-1.5">
						{provider.models.map((model) => (
							<div
								key={model.id}
								className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-xs"
							>
								<span className="font-medium">{model.name}</span>
								<div className="flex items-center gap-3 text-muted-foreground">
									<span>{formatContextWindow(model.contextWindow)}</span>
									<span>
										{formatPricing(
											model.inputPricePerMTok,
											model.outputPricePerMTok,
										)}
									</span>
								</div>
							</div>
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>

			<CardFooter className="pt-2">
				<Button variant="outline" size="sm" asChild className="w-full">
					<Link href={`/models/${provider.slug}`}>
						Configure
						<ExternalLink className="ml-1.5 size-3" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
