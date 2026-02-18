import { Suspense } from "react";
import { ChatHubView } from "@/views/chat/chat-hub-view";

export const metadata = {
	title: "Chat | AXion Hub",
};

export default function ChatPage() {
	return (
		<Suspense>
			<ChatHubView />
		</Suspense>
	);
}
