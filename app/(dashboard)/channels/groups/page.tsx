// Group channel settings are managed inline per-channel (per user decision).
// This route redirects to the main channels page to prevent a 404.
import { redirect } from "next/navigation";

export const metadata = {
	title: "Channel Groups | AXion Hub",
};

export default function ChannelGroupsPage() {
	redirect("/channels");
}
