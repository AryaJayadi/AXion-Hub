"use client";

import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import type { ConfigSection } from "@/entities/gateway-config";
import { CONFIG_SECTIONS } from "../schemas/config-schemas";
import { useConfigDraftStore } from "../model/config-draft-store";

/**
 * Validation panel displaying errors grouped by section.
 * Clicking an error navigates to that section in form mode.
 */
export function ConfigValidationPanel() {
	const validationErrors = useConfigDraftStore((s) => s.validationErrors);
	const setActiveSection = useConfigDraftStore((s) => s.setActiveSection);
	const isRawJsonMode = useConfigDraftStore((s) => s.isRawJsonMode);
	const toggleRawJsonMode = useConfigDraftStore((s) => s.toggleRawJsonMode);

	if (validationErrors.length === 0) return null;

	// Group errors by section
	const grouped = new Map<ConfigSection, typeof validationErrors>();
	for (const error of validationErrors) {
		const existing = grouped.get(error.section) ?? [];
		existing.push(error);
		grouped.set(error.section, existing);
	}

	const handleJumpToError = (section: ConfigSection) => {
		if (isRawJsonMode) {
			toggleRawJsonMode();
		}
		setActiveSection(section);
	};

	return (
		<Collapsible defaultOpen className="rounded-md border border-destructive/30 bg-destructive/5">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-3 text-sm font-medium text-destructive hover:bg-destructive/10">
				<AlertTriangle className="size-4" />
				<span>Validation Errors</span>
				<Badge variant="destructive" className="ml-auto mr-2 text-xs">
					{validationErrors.length}
				</Badge>
				<ChevronDown className="size-4 transition-transform [[data-state=open]>&]:rotate-180" />
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="divide-y divide-destructive/10 px-3 pb-3">
					{Array.from(grouped.entries()).map(([section, errors]) => {
						const sectionMeta = CONFIG_SECTIONS.find(
							(s) => s.id === section,
						);
						return (
							<div key={section} className="py-2">
								<p className="mb-1 text-xs font-medium text-muted-foreground">
									{sectionMeta?.label ?? section}
								</p>
								{errors.map((error) => (
									<button
										key={error.path + error.message}
										type="button"
										onClick={() => handleJumpToError(section)}
										className="flex w-full items-start gap-2 rounded px-2 py-1 text-left text-sm text-destructive hover:bg-destructive/10"
									>
										<AlertTriangle className="mt-0.5 size-3 shrink-0" />
										<span>
											<span className="font-mono text-xs text-muted-foreground">
												{error.path}
											</span>
											{" -- "}
											{error.message}
										</span>
									</button>
								))}
							</div>
						);
					})}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
