import type { Metadata } from "next";
import { SettingsIntegrationsView } from "@/views/settings/settings-integrations-view";

export const metadata: Metadata = {
	title: "Integrations - Settings | AXion Hub",
	description: "Connect external services like GitHub, Linear, and Jira",
};

export default function SettingsIntegrationsPage() {
	return <SettingsIntegrationsView />;
}
