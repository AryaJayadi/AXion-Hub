import type { ReactNode } from "react";
import { PageHeader } from "@/shared/ui/page-header";
import { SettingsSidebar } from "@/features/settings/components/settings-sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="p-6">
			<PageHeader
				title="Settings"
				description="Manage your workspace, profile, and preferences"
			/>
			<div className="flex flex-col md:flex-row gap-6">
				<SettingsSidebar />
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
