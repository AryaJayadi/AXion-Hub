import { Suspense } from "react";
import { SkillDetailView } from "@/views/skills/skill-detail-view";

export async function generateMetadata({
	params,
}: { params: Promise<{ skillId: string }> }) {
	const { skillId } = await params;
	return {
		title: `Skill ${skillId} | AXion Hub`,
	};
}

export default async function SkillDetailPage({
	params,
}: {
	params: Promise<{ skillId: string }>;
}) {
	const { skillId } = await params;

	return (
		<Suspense>
			<SkillDetailView skillId={skillId} />
		</Suspense>
	);
}
