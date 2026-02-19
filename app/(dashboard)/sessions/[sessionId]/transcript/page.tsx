import { Suspense } from "react";
import { SessionTranscriptView } from "@/views/sessions/session-transcript-view";
import { SkeletonList } from "@/shared/ui/loading-skeleton";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ sessionId: string }>;
}) {
	const { sessionId } = await params;
	return {
		title: `Transcript - Session ${sessionId} | AXion Hub`,
	};
}

export default async function SessionTranscriptPage({
	params,
}: {
	params: Promise<{ sessionId: string }>;
}) {
	const { sessionId } = await params;
	return (
		<Suspense fallback={<SkeletonList items={8} />}>
			<SessionTranscriptView sessionId={sessionId} />
		</Suspense>
	);
}
