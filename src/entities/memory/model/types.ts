export type MemoryType = "persistent" | "daily" | "conversation";

export interface MemoryEntry {
	id: string;
	agentId: string;
	agentName: string;
	memoryType: MemoryType;
	filePath: string;
	fileName: string;
	content: string;
	lastModified: Date;
	size: number;
}

export interface AgentMemoryGroup {
	agentId: string;
	agentName: string;
	agentAvatar: string | undefined;
	memories: MemoryEntry[];
}

export interface MemorySearchResult {
	id: string;
	agentId: string;
	agentName: string;
	memoryType: MemoryType;
	filePath: string;
	snippet: string;
	beforeContext: string;
	afterContext: string;
	relevanceScore: number;
	lastModified: Date;
}
