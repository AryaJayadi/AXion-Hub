import type { Metadata } from "next";
import { SettingsInvitesView } from "@/views/settings/settings-invites-view";

export const metadata: Metadata = {
	title: "Invitations - Settings | AXion Hub",
	description: "Invite new members and manage pending invitations",
};

export default function SettingsInvitesPage() {
	return <SettingsInvitesView />;
}
