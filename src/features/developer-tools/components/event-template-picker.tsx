"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { EVENT_TEMPLATES, getTemplateById } from "../model/event-templates";
import { usePlaygroundStore } from "../model/playground-store";

export function EventTemplatePicker() {
	const selectedTemplateId = usePlaygroundStore((s) => s.selectedTemplateId);
	const selectTemplate = usePlaygroundStore((s) => s.selectTemplate);

	const selectedTemplate = selectedTemplateId
		? getTemplateById(selectedTemplateId)
		: null;

	return (
		<div className="space-y-1.5">
			<label className="text-sm font-medium text-foreground">
				Event Template
			</label>
			<Select
				value={selectedTemplateId ?? ""}
				onValueChange={(value) => selectTemplate(value)}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select a template..." />
				</SelectTrigger>
				<SelectContent>
					{EVENT_TEMPLATES.map((template) => (
						<SelectItem key={template.id} value={template.id}>
							{template.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{selectedTemplate && (
				<p className="text-xs text-muted-foreground">
					{selectedTemplate.description}
					{selectedTemplate.method && (
						<>
							{" "}
							&mdash;{" "}
							<code className="rounded bg-muted px-1 py-0.5 text-xs">
								{selectedTemplate.method}
							</code>
						</>
					)}
				</p>
			)}
		</div>
	);
}
