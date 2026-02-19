import type { Metadata } from "next";
import { SettingsSecurityView } from "@/views/settings/settings-security-view";

export const metadata: Metadata = {
	title: "Security - Settings | AXion Hub",
	description: "Manage your password, two-factor authentication, and active sessions",
};

export default function SettingsSecurityPage() {
	return <SettingsSecurityView />;
}
