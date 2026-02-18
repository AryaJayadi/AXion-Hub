import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
				<LayoutDashboard className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">
					Welcome to AXion Hub
				</h1>
				<p className="text-muted-foreground max-w-md">
					Your mission control dashboard will appear here. Start by exploring
					the sidebar navigation to configure agents, workflows, and channels.
				</p>
			</div>
		</div>
	);
}
