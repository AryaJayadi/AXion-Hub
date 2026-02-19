"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { MemoryEntry } from "@/entities/memory";
import { useMemoryBrowser } from "@/features/memory/api/use-memory-browser";
import { MemoryAgentGroup } from "@/features/memory/components/memory-agent-group";
import { MemoryPreview } from "@/features/memory/components/memory-preview";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { SkeletonList, SkeletonDetail } from "@/shared/ui/loading-skeleton";

export function MemoryBrowserView() {
	const { groups, isLoading } = useMemoryBrowser();
	const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Memory Browser"
				description="Browse all agent memories"
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href="/memory/search">
							<Search className="mr-1.5 size-4" />
							Search memories
						</Link>
					</Button>
				}
			/>

			{isLoading ? (
				<div className="flex border rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
					<aside className="w-72 shrink-0 border-r border-border bg-muted/30 p-4">
						<SkeletonList items={4} />
					</aside>
					<div className="flex-1 p-6">
						<SkeletonDetail />
					</div>
				</div>
			) : (
				<div className="flex border rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
					{/* Left sidebar -- agent groups */}
					<aside className="w-72 shrink-0 border-r border-border bg-muted/30">
						<ScrollArea className="h-full">
							{groups.map((group, index) => (
								<MemoryAgentGroup
									key={group.agentId}
									group={group}
									defaultOpen={index === 0}
									selectedMemoryId={selectedMemory?.id ?? null}
									onSelectMemory={setSelectedMemory}
								/>
							))}
						</ScrollArea>
					</aside>

					{/* Right content -- preview */}
					<MemoryPreview entry={selectedMemory} />
				</div>
			)}
		</div>
	);
}
