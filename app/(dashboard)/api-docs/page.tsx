import type { Metadata } from "next";
import { ApiDocsView } from "@/views/developer-tools/api-docs-view";

export const metadata: Metadata = {
	title: "API Reference",
};

export default function ApiDocsPage() {
	return <ApiDocsView />;
}
