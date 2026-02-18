import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AgentTemplate, Agent } from "@/entities/agent";
import type {
	BasicsFormValues,
	ModelConfigFormValues,
	IdentityFormValues,
	SkillsToolsFormValues,
	SandboxFormValues,
	ChannelsFormValues,
} from "../schemas/wizard-schemas";

const DEFAULT_MODEL_CONFIG: ModelConfigFormValues = {
	model: "claude-sonnet-4-20250514",
	temperature: 0.7,
	maxTokens: 4096,
};

const DEFAULT_SANDBOX: SandboxFormValues = {
	enabled: false,
	image: "node:20-slim",
	workspacePath: "/workspace",
};

const DEFAULT_IDENTITY: IdentityFormValues = {
	soul: `# SOUL.md

## Core Identity
Describe your agent's personality, values, and communication style.

## Values
- Value 1
- Value 2

## Communication Style
Describe how this agent should communicate.`,
	identity: `# IDENTITY.md

## Role
Describe the agent's role.

## Capabilities
- Capability 1
- Capability 2

## Boundaries
- Boundary 1
- Boundary 2`,
	user: `# USER.md

## Preferences
- Add your preferences here

## Context
<!-- Add project-specific context here -->`,
	agents: `# AGENTS.md

## Known Agents
<!-- List other agents this agent may interact with -->

No agents configured yet. Add agent relationships as your team grows.`,
};

interface WizardState {
	currentStep: number;
	basics: BasicsFormValues | null;
	modelConfig: ModelConfigFormValues | null;
	identity: IdentityFormValues | null;
	skillsTools: SkillsToolsFormValues | null;
	sandbox: SandboxFormValues | null;
	channels: ChannelsFormValues | null;

	// Actions
	setStep: (step: number) => void;
	setBasics: (data: BasicsFormValues) => void;
	setModelConfig: (data: ModelConfigFormValues) => void;
	setIdentity: (data: IdentityFormValues) => void;
	setSkillsTools: (data: SkillsToolsFormValues) => void;
	setSandbox: (data: SandboxFormValues) => void;
	setChannels: (data: ChannelsFormValues) => void;
	loadTemplate: (template: AgentTemplate) => void;
	loadAgent: (agent: Agent) => void;
	reset: () => void;
}

const initialState = {
	currentStep: 0,
	basics: null,
	modelConfig: null,
	identity: null,
	skillsTools: null,
	sandbox: null,
	channels: null,
};

export const useWizardStore = create<WizardState>()(
	persist(
		(set) => ({
			...initialState,

			setStep: (step) => set({ currentStep: step }),
			setBasics: (data) => set({ basics: data }),
			setModelConfig: (data) => set({ modelConfig: data }),
			setIdentity: (data) => set({ identity: data }),
			setSkillsTools: (data) => set({ skillsTools: data }),
			setSandbox: (data) => set({ sandbox: data }),
			setChannels: (data) => set({ channels: data }),

			loadTemplate: (template) =>
				set({
					currentStep: 0,
					basics: template.basics,
					modelConfig: template.modelConfig,
					identity: template.identity,
					skillsTools: template.skillsTools,
					sandbox: template.sandbox,
					channels: template.channels,
				}),

			loadAgent: (agent) =>
				set({
					currentStep: 0,
					basics: {
						name: `${agent.name} (Copy)`,
						description: agent.description,
						avatar: agent.avatar,
					},
					modelConfig: {
						model: agent.model,
						temperature: DEFAULT_MODEL_CONFIG.temperature,
						maxTokens: DEFAULT_MODEL_CONFIG.maxTokens,
					},
					identity: null,
					skillsTools: null,
					sandbox: null,
					channels: null,
				}),

			reset: () => set(initialState),
		}),
		{
			name: "agent-wizard",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export { DEFAULT_MODEL_CONFIG, DEFAULT_SANDBOX, DEFAULT_IDENTITY };
