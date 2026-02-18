/**
 * Alert template presets for quick rule creation.
 *
 * Each template defines a default condition that users can customize.
 * The template picker renders these as cards; selecting one pre-fills
 * the alert rule form with the template's values.
 */

export interface AlertTemplate {
	/** Unique template identifier */
	id: string;
	/** Human-readable name */
	name: string;
	/** Short description of what this alert detects */
	description: string;
	/** Lucide icon name for display */
	icon: string;
	/** Default condition values */
	condition: {
		metric: string;
		operator: string;
		threshold: number;
		/** Duration in seconds; 0 means instant */
		duration: number;
	};
	/** Default severity level */
	severity: "critical" | "warning" | "info";
}

export const ALERT_TEMPLATES: AlertTemplate[] = [
	{
		id: "agent-down",
		name: "Agent Offline",
		description: "Alert when an agent goes offline for more than 5 minutes",
		icon: "UserX",
		condition: {
			metric: "agent.status",
			operator: "==",
			threshold: 0,
			duration: 300,
		},
		severity: "critical",
	},
	{
		id: "high-error-rate",
		name: "High Error Rate",
		description: "Alert when error rate exceeds 10% in 15 minutes",
		icon: "AlertTriangle",
		condition: {
			metric: "error.rate",
			operator: ">",
			threshold: 10,
			duration: 900,
		},
		severity: "warning",
	},
	{
		id: "context-window-full",
		name: "Context Window Full",
		description: "Alert when context usage exceeds 90%",
		icon: "Brain",
		condition: {
			metric: "agent.context_usage",
			operator: ">",
			threshold: 90,
			duration: 0,
		},
		severity: "warning",
	},
	{
		id: "gateway-disconnect",
		name: "Gateway Disconnect",
		description: "Alert when gateway is down for more than 1 minute",
		icon: "Unplug",
		condition: {
			metric: "gateway.status",
			operator: "==",
			threshold: 0,
			duration: 60,
		},
		severity: "critical",
	},
	{
		id: "cost-spike",
		name: "Cost Spike",
		description: "Alert when hourly cost exceeds $5",
		icon: "DollarSign",
		condition: {
			metric: "cost.hourly",
			operator: ">",
			threshold: 5,
			duration: 0,
		},
		severity: "info",
	},
	{
		id: "task-stuck",
		name: "Task Stuck",
		description: "Alert when a task is in-progress for more than 30 minutes",
		icon: "Clock",
		condition: {
			metric: "task.duration",
			operator: ">",
			threshold: 30,
			duration: 1800,
		},
		severity: "warning",
	},
];
