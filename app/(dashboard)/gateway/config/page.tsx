import { PageHeader } from "@/shared/ui/page-header";

export const metadata = {
	title: "Gateway Config | AXion Hub",
};

export default function GatewayConfigPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Configuration"
				description="View and edit OpenClaw gateway configuration"
			/>
			<p className="text-sm text-muted-foreground">Coming in plan 07-03</p>
		</div>
	);
}
