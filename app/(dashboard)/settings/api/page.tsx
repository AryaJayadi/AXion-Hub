import type { Metadata } from "next";
import { SettingsApiView } from "@/views/settings/settings-api-view";

export const metadata: Metadata = {
	title: "API Keys - Settings | AXion Hub",
	description: "Manage API keys for external integrations",
};

export default function SettingsApiPage() {
	return <SettingsApiView />;
}
