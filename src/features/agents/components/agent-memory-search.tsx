"use client";

import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/shared/ui/input";

interface AgentMemorySearchProps {
	onSearch: (query: string) => void;
	placeholder?: string | undefined;
}

export function AgentMemorySearch({
	onSearch,
	placeholder = "Search memory files...",
}: AgentMemorySearchProps) {
	const debouncedSearch = useDebouncedCallback((value: string) => {
		onSearch(value);
	}, 300);

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
			<Input
				placeholder={placeholder}
				onChange={(e) => debouncedSearch(e.target.value)}
				className="pl-9"
			/>
		</div>
	);
}
