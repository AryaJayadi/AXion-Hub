"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input";
import {
	DOC_CATEGORIES,
	getDocsByCategory,
	type DocPage,
} from "@/features/docs/lib/docs-content";

function CategorySection({
	label,
	pages,
	pathname,
}: {
	label: string;
	pages: DocPage[];
	pathname: string;
}) {
	const [expanded, setExpanded] = useState(true);

	if (pages.length === 0) return null;

	return (
		<div>
			<button
				type="button"
				onClick={() => setExpanded((prev) => !prev)}
				className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
			>
				<ChevronRight
					className={cn(
						"size-3.5 transition-transform",
						expanded && "rotate-90",
					)}
				/>
				{label}
			</button>

			{expanded && (
				<div className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-2">
					{pages.map((page) => {
						const href = `/docs/${page.slug}`;
						const isActive = pathname === href;

						return (
							<Link
								key={page.slug}
								href={href}
								className={cn(
									"block rounded-md px-2 py-1.5 text-sm transition-colors",
									isActive
										? "bg-accent text-accent-foreground font-medium"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
								)}
							>
								{page.title}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

export function DocsSidebar() {
	const pathname = usePathname();
	const [search, setSearch] = useState("");

	const lowerSearch = search.toLowerCase();

	return (
		<nav className="w-full md:w-56 shrink-0 space-y-3">
			{/* Search input */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search docs..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="h-8 pl-8 text-sm"
				/>
			</div>

			{/* Category sections */}
			{DOC_CATEGORIES.map((cat) => {
				const pages = getDocsByCategory(cat.id).filter(
					(p) =>
						!lowerSearch ||
						p.title.toLowerCase().includes(lowerSearch),
				);
				return (
					<CategorySection
						key={cat.id}
						label={cat.label}
						pages={pages}
						pathname={pathname}
					/>
				);
			})}
		</nav>
	);
}
