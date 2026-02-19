import { PageHeader } from "@/shared/ui/page-header";
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";

export default function DocsLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="space-y-0">
			<PageHeader
				title="Documentation"
				description="Browse guides, references, and tutorials for AXion Hub."
			/>
			<div className="flex flex-col md:flex-row gap-6">
				<DocsSidebar />
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
