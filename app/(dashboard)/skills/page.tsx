import { Suspense } from "react";
import { SkillsLibraryView } from "@/views/skills/skills-library-view";

export const metadata = {
	title: "Skills Library | AXion Hub",
};

export default function SkillsPage() {
	return (
		<Suspense>
			<SkillsLibraryView />
		</Suspense>
	);
}
