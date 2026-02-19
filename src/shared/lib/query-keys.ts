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
		transcript: (id: string) =>
			[...queryKeys.sessions.details(), id, "transcript"] as const,
	},
	gateway: {
		all: ["gateway"] as const,
		health: () => [...queryKeys.gateway.all, "health"] as const,
		config: () => [...queryKeys.gateway.all, "config"] as const,
		instances: () => [...queryKeys.gateway.all, "instances"] as const,
		instance: (id: string) =>
			[...queryKeys.gateway.instances(), id] as const,
		nodes: (instanceId: string) =>
			[...queryKeys.gateway.all, "nodes", instanceId] as const,
	},
	audit: {
		all: ["audit"] as const,
		lists: () => [...queryKeys.audit.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.audit.lists(), filters] as const,
	},
	conversations: {
		all: ["conversations"] as const,
		lists: () => [...queryKeys.conversations.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.conversations.lists(), filters] as const,
		details: () => [...queryKeys.conversations.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.conversations.details(), id] as const,
	},
	messages: {
		all: ["messages"] as const,
		byConversation: (conversationId: string) =>
			[...queryKeys.messages.all, "conversation", conversationId] as const,
		search: (query: string, scope?: string) =>
			[...queryKeys.messages.all, "search", { query, scope }] as const,
	},
	dashboard: {
		all: ["dashboard"] as const,
		stats: () => [...queryKeys.dashboard.all, "stats"] as const,
		costs: (period: string) =>
			[...queryKeys.dashboard.all, "costs", period] as const,
		perAgentCosts: () =>
			[...queryKeys.dashboard.all, "per-agent-costs"] as const,
	},
	activity: {
		all: ["activity"] as const,
		lists: () => [...queryKeys.activity.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.activity.lists(), filters] as const,
		details: () => [...queryKeys.activity.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.activity.details(), id] as const,
	},
	boards: {
		all: ["boards"] as const,
		lists: () => [...queryKeys.boards.all, "list"] as const,
		detail: (id: string) =>
			[...queryKeys.boards.all, "detail", id] as const,
		settings: (id: string) =>
			[...queryKeys.boards.all, "settings", id] as const,
	},
	tasks: {
		all: ["tasks"] as const,
		byBoard: (boardId: string) =>
			[...queryKeys.tasks.all, "board", boardId] as const,
		detail: (taskId: string) =>
			[...queryKeys.tasks.all, "detail", taskId] as const,
		comments: (taskId: string) =>
			[...queryKeys.tasks.all, "comments", taskId] as const,
		activity: (taskId: string) =>
			[...queryKeys.tasks.all, "activity", taskId] as const,
	},
	channels: {
		all: ["channels"] as const,
		lists: () => [...queryKeys.channels.all, "list"] as const,
		detail: (id: string) =>
			[...queryKeys.channels.all, "detail", id] as const,
		routing: () => [...queryKeys.channels.all, "routing"] as const,
	},
	models: {
		all: ["models"] as const,
		providers: () => [...queryKeys.models.all, "providers"] as const,
		provider: (id: string) =>
			[...queryKeys.models.providers(), id] as const,
		catalog: () => [...queryKeys.models.all, "catalog"] as const,
		failover: () => [...queryKeys.models.all, "failover"] as const,
		usage: (dimension: string, period: string) =>
			[...queryKeys.models.all, "usage", { dimension, period }] as const,
	},
	alerts: {
		all: ["alerts"] as const,
		rules: () => [...queryKeys.alerts.all, "rules"] as const,
		rule: (id: string) => [...queryKeys.alerts.rules(), id] as const,
		notifications: () =>
			[...queryKeys.alerts.all, "notifications"] as const,
		notificationList: (filters?: Record<string, unknown>) =>
			[...queryKeys.alerts.notifications(), filters] as const,
	},
	approvals: {
		all: ["approvals"] as const,
		lists: () => [...queryKeys.approvals.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.approvals.lists(), filters] as const,
		details: () => [...queryKeys.approvals.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.approvals.details(), id] as const,
	},
	memory: {
		all: ["memory"] as const,
		browser: () => [...queryKeys.memory.all, "browser"] as const,
		search: (query: string, agentId?: string) =>
			[...queryKeys.memory.all, "search", { query, agentId }] as const,
	},
	workspace: {
		all: ["workspace"] as const,
		tree: () => [...queryKeys.workspace.all, "tree"] as const,
		files: (agentId: string) =>
			[...queryKeys.workspace.all, "files", agentId] as const,
		file: (agentId: string, path: string) =>
			[...queryKeys.workspace.all, "file", agentId, path] as const,
	},
	deliverables: {
		all: ["deliverables"] as const,
		lists: () => [...queryKeys.deliverables.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.deliverables.lists(), filters] as const,
		detail: (id: string) =>
			[...queryKeys.deliverables.all, "detail", id] as const,
	},
	governance: {
		all: ["governance"] as const,
		policies: () => [...queryKeys.governance.all, "policies"] as const,
		policy: (id: string) =>
			[...queryKeys.governance.policies(), id] as const,
		auditTrail: (filters?: Record<string, unknown>) =>
			[...queryKeys.governance.all, "audit-trail", filters] as const,
	},
	skills: {
		all: ["skills"] as const,
		lists: () => [...queryKeys.skills.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.skills.lists(), filters] as const,
		details: () => [...queryKeys.skills.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.skills.details(), id] as const,
	},
	clawhub: {
		all: ["clawhub"] as const,
		lists: () => [...queryKeys.clawhub.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.clawhub.lists(), filters] as const,
		categories: () => [...queryKeys.clawhub.all, "categories"] as const,
	},
	plugins: {
		all: ["plugins"] as const,
		lists: () => [...queryKeys.plugins.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.plugins.lists(), filters] as const,
		details: () => [...queryKeys.plugins.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.plugins.details(), id] as const,
		available: () => [...queryKeys.plugins.all, "available"] as const,
	},
	workflows: {
		all: ["workflows"] as const,
		lists: () => [...queryKeys.workflows.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.workflows.lists(), filters] as const,
		details: () => [...queryKeys.workflows.all, "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.workflows.details(), id] as const,
		runs: (id: string) =>
			[...queryKeys.workflows.all, "runs", id] as const,
		cron: () => [...queryKeys.workflows.all, "cron"] as const,
		webhooks: () => [...queryKeys.workflows.all, "webhooks"] as const,
	},
} as const;
