import { Suspense } from "react";
import { MissionsBoardView } from "@/views/missions/missions-board-view";

export const metadata = {
	title: "Missions | AXion Hub",
};

export default function MissionsPage() {
	return (
		<Suspense>
			<MissionsBoardView />
		</Suspense>
	);
}
