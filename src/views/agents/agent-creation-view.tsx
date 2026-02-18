"use client";

import { useRouter } from "next/navigation";
import { WizardShell } from "@/features/agents/wizard/wizard-shell";
import { PageHeader } from "@/shared/ui/page-header";

export function AgentCreationView() {
	const router = useRouter();

	function handleComplete() {
		router.push("/agents");
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Create Agent"
				description="Configure your new agent step by step."
				breadcrumbs={[{ label: "Agents", href: "/agents" }, { label: "New Agent" }]}
			/>

			<WizardShell onComplete={handleComplete} />
		</div>
	);
}
