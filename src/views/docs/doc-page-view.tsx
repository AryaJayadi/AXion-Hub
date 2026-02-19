"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { DocRenderer } from "@/features/docs/components/doc-renderer";
import { getDocBySlug, getAdjacentDocs } from "@/features/docs/lib/docs-content";

interface DocPageViewProps {
	slug: string[];
}

export function DocPageView({ slug }: DocPageViewProps) {
	const doc = getDocBySlug(slug);

	if (!doc) {
		return (
			<EmptyState
				icon={<FileQuestion className="size-12 text-muted-foreground/40" />}
				title="Page Not Found"
				description="The documentation page you are looking for does not exist. It may have been moved or removed."
				action={{
					label: "Back to Docs",
					onClick: () => {
						window.location.href = "/docs";
					},
				}}
			/>
		);
	}

	const { prev, next } = getAdjacentDocs(slug);

	return (
		<div className="space-y-8">
			<DocRenderer title={doc.title} content={doc.content} />

			{/* Previous / Next navigation */}
			<nav className="flex items-center justify-between border-t border-border pt-6">
				{prev ? (
					<Button variant="ghost" size="sm" asChild>
						<Link href={`/docs/${prev.slug}`}>
							<ChevronLeft className="mr-1 size-4" />
							{prev.title}
						</Link>
					</Button>
				) : (
					<span />
				)}

				{next ? (
					<Button variant="ghost" size="sm" asChild>
						<Link href={`/docs/${next.slug}`}>
							{next.title}
							<ChevronRight className="ml-1 size-4" />
						</Link>
					</Button>
				) : (
					<span />
				)}
			</nav>
		</div>
	);
}
