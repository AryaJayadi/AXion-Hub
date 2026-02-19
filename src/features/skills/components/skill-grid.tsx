"use client";

import { useMemo } from "react";
import type { Skill, SkillCategory } from "@/entities/skill";
import { SkillCard } from "./skill-card";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
	code: "Code",
	communication: "Communication",
	data: "Data",
	productivity: "Productivity",
	integration: "Integration",
	security: "Security",
};

const CATEGORY_ORDER: SkillCategory[] = [
	"code",
	"communication",
	"data",
	"productivity",
	"integration",
	"security",
];

interface SkillGridProps {
	skills: Skill[];
}

export function SkillGrid({ skills }: SkillGridProps) {
	const groupedSkills = useMemo(() => {
		const groups = new Map<SkillCategory, Skill[]>();

		for (const skill of skills) {
			const existing = groups.get(skill.category) ?? [];
			existing.push(skill);
			groups.set(skill.category, existing);
		}

		return groups;
	}, [skills]);

	return (
		<div className="space-y-8">
			{CATEGORY_ORDER.map((category) => {
				const categorySkills = groupedSkills.get(category);
				if (!categorySkills || categorySkills.length === 0) return null;

				return (
					<section key={category}>
						<h2 className="mb-3 text-sm font-semibold text-foreground">
							{CATEGORY_LABELS[category]}{" "}
							<span className="font-normal text-muted-foreground">
								({categorySkills.length})
							</span>
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{categorySkills.map((skill) => (
								<SkillCard key={skill.id} skill={skill} />
							))}
						</div>
					</section>
				);
			})}
		</div>
	);
}
