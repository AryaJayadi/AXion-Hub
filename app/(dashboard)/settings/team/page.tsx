import type { Metadata } from "next";
import { SettingsTeamView } from "@/views/settings/settings-team-view";

export const metadata: Metadata = {
	title: "Team - Settings | AXion Hub",
	description: "Manage your organization members and roles",
};

export default function SettingsTeamPage() {
	return <SettingsTeamView />;
}
