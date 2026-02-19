import type { Metadata } from "next";
import { SettingsNotificationsView } from "@/views/settings/settings-notifications-view";

export const metadata: Metadata = {
	title: "Notifications - Settings | AXion Hub",
	description: "Configure notification preferences for email, webhook, Slack, and Discord",
};

export default function SettingsNotificationsPage() {
	return <SettingsNotificationsView />;
}
