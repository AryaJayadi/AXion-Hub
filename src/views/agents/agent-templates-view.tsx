"use client";

import { useRouter } from "next/navigation";
import { AGENT_TEMPLATES } from "@/entities/agent";
import { AgentTemplateCard } from "@/features/agents/components/agent-template-card";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { useWizardStore } from "@/features/agents/model/wizard-store";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";

export function AgentTemplatesView() {
	const router = useRouter();
	const agents = useAgentStore((s) => s.agents);
	const loadAgent = useWizardStore((s) => s.loadAgent);
	const reset = useWizardStore((s) => s.reset);

	function handleCloneAgent(agentId: string) {
		const agent = agents.find((a) => a.id === agentId);
		if (!agent) return;
		loadAgent(agent);
		router.push("/agents/new");
	}

	function handleStartFromScratch() {
		reset();
		router.push("/agents/new");
	}

	return (
		<div className="space-y-8">
			<PageHeader
				title="Agent Templates"
				description="Choose a template to get started quickly, clone an existing agent, or start from scratch."
				breadcrumbs={[{ label: "Agents", href: "/agents" }, { label: "Templates" }]}
			/>

			{/* Template Gallery */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{AGENT_TEMPLATES.map((template) => (
					<AgentTemplateCard key={template.id} template={template} />
				))}
			</div>

			<Separator />

			{/* Clone Existing Agent */}
			<div className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold">Clone an Existing Agent</h2>
					<p className="text-sm text-muted-foreground">
						Select an agent to clone its configuration into a new agent.
					</p>
				</div>

				{agents.length > 0 ? (
					<div className="flex items-end gap-3">
						<div className="w-full max-w-sm">
							<Select onValueChange={handleCloneAgent}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select an agent to clone" />
								</SelectTrigger>
								<SelectContent>
									{agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{agent.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No agents available to clone. Create your first agent to enable cloning.
					</p>
				)}
			</div>

			<Separator />

			{/* Start from Scratch */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Start from Scratch</h2>
					<p className="text-sm text-muted-foreground">
						Create a new agent with a blank configuration and smart defaults.
					</p>
				</div>
				<Button variant="outline" onClick={handleStartFromScratch}>
					Start from Scratch
				</Button>
			</div>
		</div>
	);
}
