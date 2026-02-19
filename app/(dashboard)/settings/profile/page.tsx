import type { Metadata } from "next";
import { SettingsProfileView } from "@/views/settings/settings-profile-view";

export const metadata: Metadata = {
	title: "Profile Settings | AXion Hub",
	description: "Manage your display name and avatar",
};

export default function SettingsProfilePage() {
	return <SettingsProfileView />;
}
