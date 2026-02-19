import type { Metadata } from "next";
import { WsPlaygroundView } from "@/views/developer-tools/ws-playground-view";

export const metadata: Metadata = {
	title: "WebSocket Playground",
};

export default function WsPlaygroundPage() {
	return <WsPlaygroundView />;
}
