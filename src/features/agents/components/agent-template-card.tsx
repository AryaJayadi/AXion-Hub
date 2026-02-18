"use client";

import type { LucideIcon } from "lucide-react";
import { BarChart3, Bot, Code, FileText, Headphones, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AgentTemplate } from "@/entities/agent";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useWizardStore } from "../model/wizard-store";

interface AgentTemplateCardProps {
	template: AgentTemplate;
}

const ICON_MAP: Record<string, LucideIcon> = {
	Code,
	Search,
	Headphones,
	FileText,
	BarChart3,
	Bot,
};

function getIcon(iconName: string): LucideIcon {
	return ICON_MAP[iconName] ?? Bot;
}

export function AgentTemplateCard({ template }: AgentTemplateCardProps) {
	const loadTemplate = useWizardStore((s) => s.loadTemplate);
	const router = useRouter();

	const Icon = getIcon(template.icon);

	function handleUseTemplate() {
		loadTemplate(template);
		router.push("/agents/new");
	}

	return (
		<Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Icon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-sm">{template.name}</CardTitle>
							<Badge variant="secondary" className="mt-1 text-xs">
								{template.category}
							</Badge>
						</div>
					</div>
				</div>
				<CardDescription className="mt-2">{template.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" size="sm" className="w-full" onClick={handleUseTemplate}>
					Use Template
				</Button>
			</CardContent>
		</Card>
	);
}
