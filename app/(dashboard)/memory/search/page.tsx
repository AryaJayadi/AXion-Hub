import { Suspense } from "react";
import { MemorySearchView } from "@/views/memory/memory-search-view";

export const metadata = {
	title: "Memory Search | AXion Hub",
};

export default function MemorySearchPage() {
	return (
		<Suspense>
			<MemorySearchView />
		</Suspense>
	);
}
