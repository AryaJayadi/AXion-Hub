import type { Metadata } from "next";
import { SettingsDangerView } from "@/views/settings/settings-danger-view";

export const metadata: Metadata = {
	title: "Danger Zone - Settings | AXion Hub",
	description: "Destructive workspace actions including reset and deletion",
};

export default function SettingsDangerPage() {
	return <SettingsDangerView />;
}
