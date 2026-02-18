// Agents feature -- barrel export

export { useAgentDetail } from "./api/use-agent-detail";
export { useAgentIdentity } from "./api/use-agent-identity";
export { useCreateAgent, useDeleteAgent } from "./api/use-agent-mutations";
export { useAgents } from "./api/use-agents";
export { AgentCard } from "./components/agent-card";
export { AgentGrid } from "./components/agent-grid";
export { AgentIdentityEditor } from "./components/agent-identity-editor";
export { AgentIdentitySidebar } from "./components/agent-identity-sidebar";
export { AgentOverviewWidgets } from "./components/agent-overview-widgets";
export { AgentQuickActions } from "./components/agent-quick-actions";
export { AgentRecentActivity } from "./components/agent-recent-activity";
export { AgentSearchBar } from "./components/agent-search-bar";
export type { IdentityFileKey, IdentityFileTemplate } from "./lib/identity-templates";
export { IDENTITY_FILE_DEFAULTS, IDENTITY_FILE_KEYS } from "./lib/identity-templates";
export { initAgentStoreSubscriptions, useAgentStore } from "./model/agent-store";
