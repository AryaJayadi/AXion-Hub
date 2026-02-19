import type { Metadata } from "next";
import { DocsView } from "@/views/docs/docs-view";

export const metadata: Metadata = {
	title: "Documentation",
};

export default function DocsPage() {
	return <DocsView />;
}
