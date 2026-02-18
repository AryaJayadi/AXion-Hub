import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Models | AXion Hub",
};

export default function ModelsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Models"
				description="Manage AI model providers and configurations"
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-05</p>
		</div>
	);
}
