import type { Metadata } from "next";
import { getDocBySlug } from "@/features/docs/lib/docs-content";
import { DocPageView } from "@/views/docs/doc-page-view";

interface DocSlugPageProps {
	params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
	params,
}: DocSlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const doc = getDocBySlug(slug);
	return {
		title: doc ? `${doc.title} - Documentation` : "Page Not Found",
	};
}

export default async function DocSlugPage({ params }: DocSlugPageProps) {
	const { slug } = await params;
	return <DocPageView slug={slug} />;
}
