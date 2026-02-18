import { Suspense } from "react";
import { MissionDetailView } from "@/views/missions/mission-detail-view";

export const metadata = {
	title: "Task Detail | AXion Hub",
};

export default async function MissionDetailPage({
	params,
}: {
	params: Promise<{ taskId: string }>;
}) {
	const { taskId } = await params;

	return (
		<Suspense>
			<MissionDetailView taskId={taskId} />
		</Suspense>
	);
}
