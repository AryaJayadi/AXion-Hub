import { Suspense } from "react";
import { MissionCreateView } from "@/views/missions/mission-create-view";

export const metadata = {
	title: "New Task | AXion Hub",
};

export default function NewMissionPage() {
	return (
		<Suspense>
			<MissionCreateView />
		</Suspense>
	);
}
