import { Suspense } from "react";
import { SessionDetailView } from "@/views/sessions/session-detail-view";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ sessionId: string }>;
}) {
	const { sessionId } = await params;
	return {
		title: `Session ${sessionId} | AXion Hub`,
	};
}

export default async function SessionDetailPage({
	params,
}: {
	params: Promise<{ sessionId: string }>;
}) {
	const { sessionId } = await params;
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<SessionDetailView sessionId={sessionId} />
		</Suspense>
	);
}
