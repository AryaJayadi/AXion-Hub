"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface AgentSearchBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	status: string;
	onStatusChange: (value: string) => void;
}

export function AgentSearchBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
}: AgentSearchBarProps) {
	return (
		<div className="flex items-center gap-3">
			<SearchInput
				value={search}
				onChange={onSearchChange}
				placeholder="Search agents by name..."
				className="flex-1"
				debounceMs={200}
			/>

			<Select value={status} onValueChange={onStatusChange}>
				<SelectTrigger className="w-[140px]">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All statuses</SelectItem>
					<SelectItem value="online">Online</SelectItem>
					<SelectItem value="idle">Idle</SelectItem>
					<SelectItem value="working">Working</SelectItem>
					<SelectItem value="error">Error</SelectItem>
					<SelectItem value="offline">Offline</SelectItem>
				</SelectContent>
			</Select>

			<Button asChild size="sm">
				<Link href="/agents/new">
					<Plus className="size-4" />
					New Agent
				</Link>
			</Button>
		</div>
	);
}
