"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { SearchInput } from "@/shared/ui/search-input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useSkills } from "@/features/skills/api/use-skills";
import { SkillGrid } from "@/features/skills/components/skill-grid";

export function SkillsLibraryView() {
	const { data: skills, isLoading } = useSkills();

	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);

	const filteredSkills = useMemo(() => {
		if (!skills) return [];
		if (!search) return skills;

		const q = search.toLowerCase();
		return skills.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				s.description.toLowerCase().includes(q),
		);
	}, [skills, search]);

	return (
		<div>
			<PageHeader
				title="Skills Library"
				description="Manage installed skills across your workspace"
				actions={
					<Button asChild>
						<Link href="/skills/clawhub">
							<ExternalLink className="mr-1.5 size-4" />
							Browse ClawHub
						</Link>
					</Button>
				}
			/>

			<div className="mb-6">
				<SearchInput
					value={search}
					onChange={setSearch}
					placeholder="Search installed skills..."
					className="max-w-md"
				/>
			</div>

			{isLoading ? (
				<SkillsLoadingSkeleton />
			) : (
				<SkillGrid skills={filteredSkills} />
			)}
		</div>
	);
}

function SkillsLoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div>
				<Skeleton className="mb-3 h-5 w-24" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
			</div>
			<div>
				<Skeleton className="mb-3 h-5 w-32" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
			</div>
		</div>
	);
}
