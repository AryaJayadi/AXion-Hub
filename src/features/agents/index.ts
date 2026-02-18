// Agents feature -- barrel export

export { useAgentDetail } from "./api/use-agent-detail";
export { useAgentIdentity } from "./api/use-agent-identity";
export { useAgentLogs } from "./api/use-agent-logs";
export { useAgentMetrics } from "./api/use-agent-metrics";
export { useCreateAgent, useDeleteAgent } from "./api/use-agent-mutations";
export { useAgentSkills } from "./api/use-agent-skills";
export { useAgents } from "./api/use-agents";
export { AgentCard } from "./components/agent-card";
export { AgentChannelsTable } from "./components/agent-channels-table";
export { AgentGrid } from "./components/agent-grid";
export { AgentIdentityEditor } from "./components/agent-identity-editor";
export { AgentIdentitySidebar } from "./components/agent-identity-sidebar";
export { AgentLogsTable } from "./components/agent-logs-table";
export { AgentMetricsCharts } from "./components/agent-metrics-charts";
export { AgentOverviewWidgets } from "./components/agent-overview-widgets";
export { AgentQuickActions } from "./components/agent-quick-actions";
export { AgentRecentActivity } from "./components/agent-recent-activity";
export { AgentSandboxForm } from "./components/agent-sandbox-form";
export { AgentSearchBar } from "./components/agent-search-bar";
export { AgentSkillsGrid } from "./components/agent-skills-grid";
export { AgentToolsConfig } from "./components/agent-tools-config";
export type { IdentityFileKey, IdentityFileTemplate } from "./lib/identity-templates";
export { IDENTITY_FILE_DEFAULTS, IDENTITY_FILE_KEYS } from "./lib/identity-templates";
export { initAgentStoreSubscriptions, useAgentStore } from "./model/agent-store";
