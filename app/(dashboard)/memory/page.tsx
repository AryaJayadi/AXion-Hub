import { Suspense } from "react";
import { MemoryBrowserView } from "@/views/memory/memory-browser-view";

export const metadata = {
	title: "Memory Browser | AXion Hub",
};

export default function MemoryPage() {
	return (
		<Suspense>
			<MemoryBrowserView />
		</Suspense>
	);
}
