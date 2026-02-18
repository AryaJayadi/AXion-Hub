"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Board } from "@/entities/mission";
import { CORE_COLUMNS } from "@/entities/mission";
import { queryKeys } from "@/shared/lib/query-keys";
import { useBoardStore } from "../model/board-store";

/** Mock board data -- will be replaced with API call */
const MOCK_BOARDS: Board[] = [
	{
		id: "board-general",
		name: "General",
		orgId: "org-default",
		columns: CORE_COLUMNS,
		createdAt: new Date("2026-01-15"),
	},
];

async function fetchBoards(): Promise<Board[]> {
	// Simulate API latency
	await new Promise((r) => setTimeout(r, 200));
	return MOCK_BOARDS;
}

export function useBoards() {
	const setBoards = useBoardStore((s) => s.setBoards);
	const setColumns = useBoardStore((s) => s.setColumns);

	const query = useQuery({
		queryKey: queryKeys.boards.lists(),
		queryFn: fetchBoards,
		staleTime: Number.POSITIVE_INFINITY, // WebSocket handles freshness
	});

	useEffect(() => {
		if (query.data) {
			setBoards(query.data);
			const firstBoard = query.data[0];
			if (firstBoard) {
				setColumns(firstBoard.columns);
			}
		}
	}, [query.data, setBoards, setColumns]);

	return {
		boards: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
	};
}
