import type { Metadata } from "next";
import { SettingsGeneralView } from "@/views/settings/settings-general-view";

export const metadata: Metadata = {
	title: "General Settings | AXion Hub",
	description: "Configure workspace name, timezone, language, and theme",
};

export default function SettingsPage() {
	return <SettingsGeneralView />;
}
