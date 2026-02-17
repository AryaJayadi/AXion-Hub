/**
 * TanStack Query key factory for consistent cache management.
 *
 * Pattern: each domain has a root key, with sub-keys for specific queries.
 * This ensures consistent cache keys across the app and enables precise
 * cache invalidation.
 *
 * Examples:
 *   queryKeys.agents.all           -> ['agents']
 *   queryKeys.agents.lists()       -> ['agents', 'list']
 *   queryKeys.agents.list(filters) -> ['agents', 'list', { status: 'online' }]
 *   queryKeys.agents.detail(id)    -> ['agents', 'detail', 'abc123']
 *
 * Invalidation patterns:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
 *     -> invalidates ALL agent queries (lists, details, everything)
 *   queryClient.invalidateQueries({ queryKey: queryKeys.agents.lists() })
 *     -> invalidates only agent list queries
 *   queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail('abc') })
 *     -> invalidates only the specific agent detail
 */

export const queryKeys = {
	agents: {
		all: ["agents"] as const,
		lists: () => [...queryKeys.agents.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.agents.lists(), filters] as const,
		details: () => [...queryKeys.agents.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.agents.details(), id] as const,
	},
	sessions: {
		all: ["sessions"] as const,
		lists: () => [...queryKeys.sessions.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.sessions.lists(), filters] as const,
		details: () => [...queryKeys.sessions.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.sessions.details(), id] as const,
	},
	gateway: {
		all: ["gateway"] as const,
		health: () => [...queryKeys.gateway.all, "health"] as const,
		config: () => [...queryKeys.gateway.all, "config"] as const,
	},
	audit: {
		all: ["audit"] as const,
		lists: () => [...queryKeys.audit.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.audit.lists(), filters] as const,
	},
} as const;
