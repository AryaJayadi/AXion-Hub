"use client";

import {
	UserX,
	AlertTriangle,
	Brain,
	Unplug,
	DollarSign,
	Clock,
	type LucideIcon,
} from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
	ALERT_TEMPLATES,
	type AlertTemplate,
} from "../lib/alert-templates";

/** Map template icon names to actual Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
	UserX,
	AlertTriangle,
	Brain,
	Unplug,
	DollarSign,
	Clock,
};

const SEVERITY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	critical: "destructive",
	warning: "default",
	info: "secondary",
};

interface AlertTemplatePickerProps {
	onSelect: (template: AlertTemplate) => void;
}

export function AlertTemplatePicker({ onSelect }: AlertTemplatePickerProps) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{ALERT_TEMPLATES.map((template) => {
				const Icon = ICON_MAP[template.icon] ?? AlertTriangle;
				const variant = SEVERITY_VARIANTS[template.severity] ?? "secondary";

				return (
					<button
						key={template.id}
						type="button"
						onClick={() => onSelect(template)}
						className="text-left"
					>
						<Card className="flex h-full cursor-pointer flex-col gap-3 p-4 transition-colors hover:bg-muted/50">
							<div className="flex items-start justify-between">
								<div className="flex size-9 items-center justify-center rounded-lg bg-muted">
									<Icon className="size-4 text-muted-foreground" />
								</div>
								<Badge variant={variant}>
									{template.severity}
								</Badge>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium leading-tight">
									{template.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{template.description}
								</p>
							</div>

							<p className="mt-auto text-xs text-muted-foreground">
								{template.condition.metric} {template.condition.operator}{" "}
								{template.condition.threshold}
								{template.condition.duration > 0 &&
									` for ${template.condition.duration}s`}
							</p>
						</Card>
					</button>
				);
			})}
		</div>
	);
}
