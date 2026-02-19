import type { Metadata } from "next";
import { SettingsBackupView } from "@/views/settings/settings-backup-view";

export const metadata: Metadata = {
	title: "Backup & Export - Settings | AXion Hub",
	description: "Export workspace configuration, sessions, and full workspace data",
};

export default function SettingsBackupPage() {
	return <SettingsBackupView />;
}
