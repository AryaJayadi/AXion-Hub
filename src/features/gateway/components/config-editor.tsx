"use client";

import { useCallback, useEffect, useState } from "react";
import { Code, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { ConfigSection, OpenClawConfig } from "@/entities/gateway-config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";

import { useGatewayConfig, useApplyConfig } from "../api/use-gateway-config";
import { useConfigDraftStore } from "../model/config-draft-store";
import { CONFIG_SECTIONS } from "../schemas/config-schemas";
import { ConfigDiffViewer } from "./config-diff-viewer";
import { ConfigRawJson } from "./config-raw-json";
import { ConfigValidationPanel } from "./config-validation-panel";
import { ConfigSectionIdentity } from "./config-section-identity";
import { ConfigSectionSessions } from "./config-section-sessions";
import { ConfigSectionChannels } from "./config-section-channels";
import { ConfigSectionModels } from "./config-section-models";
import { ConfigSectionCompaction } from "./config-section-compaction";
import { ConfigSectionMemory } from "./config-section-memory";
import { ConfigSectionSecurity } from "./config-section-security";
import { ConfigSectionPlugins } from "./config-section-plugins";
import { ConfigSectionGateway } from "./config-section-gateway";

/** Map section ID to its form component */
function SectionForm({
	section,
	config,
	onUpdate,
}: {
	section: ConfigSection;
	config: OpenClawConfig;
	onUpdate: (section: ConfigSection, values: unknown) => void;
}) {
	const handleUpdate = useCallback(
		(values: unknown) => onUpdate(section, values),
		[section, onUpdate],
	);

	switch (section) {
		case "identity":
			return (
				<ConfigSectionIdentity
					values={config.identity}
					onUpdate={handleUpdate}
				/>
			);
		case "sessions":
			return (
				<ConfigSectionSessions
					values={config.sessions}
					onUpdate={handleUpdate}
				/>
			);
		case "channels":
			return (
				<ConfigSectionChannels
					values={config.channels}
					onUpdate={handleUpdate as (values: Record<string, unknown>) => void}
				/>
			);
		case "models":
			return (
				<ConfigSectionModels
					values={config.models}
					onUpdate={handleUpdate}
				/>
			);
		case "compaction":
			return (
				<ConfigSectionCompaction
					values={config.compaction}
					onUpdate={handleUpdate}
				/>
			);
		case "memorySearch":
			return (
				<ConfigSectionMemory
					values={config.memorySearch}
					onUpdate={handleUpdate}
				/>
			);
		case "security":
			return (
				<ConfigSectionSecurity
					values={config.security}
					onUpdate={handleUpdate}
				/>
			);
		case "plugins":
			return (
				<ConfigSectionPlugins
					values={config.plugins}
					onUpdate={handleUpdate}
				/>
			);
		case "gateway":
			return (
				<ConfigSectionGateway
					values={config.gateway}
					onUpdate={handleUpdate}
				/>
			);
	}
}

/**
 * Main config editor composition component.
 * Tabbed sections, form/JSON toggle, draft-then-apply workflow.
 */
export function ConfigEditor() {
	const { data: configData, isLoading } = useGatewayConfig();
	const applyMutation = useApplyConfig();

	const loadConfig = useConfigDraftStore((s) => s.loadConfig);
	const draftConfig = useConfigDraftStore((s) => s.draftConfig);
	const activeSection = useConfigDraftStore((s) => s.activeSection);
	const setActiveSection = useConfigDraftStore((s) => s.setActiveSection);
	const isRawJsonMode = useConfigDraftStore((s) => s.isRawJsonMode);
	const toggleRawJsonMode = useConfigDraftStore((s) => s.toggleRawJsonMode);
	const isDirty = useConfigDraftStore((s) => s.isDirty);
	const isApplying = useConfigDraftStore((s) => s.isApplying);
	const setIsApplying = useConfigDraftStore((s) => s.setIsApplying);
	const resetDraft = useConfigDraftStore((s) => s.resetDraft);
	const updateSection = useConfigDraftStore((s) => s.updateSection);
	const validationErrors = useConfigDraftStore((s) => s.validationErrors);
	const getDiffs = useConfigDraftStore((s) => s.getDiffs);

	const [showReviewDialog, setShowReviewDialog] = useState(false);

	// Load config into draft store when data arrives
	useEffect(() => {
		if (configData) {
			loadConfig(configData);
		}
	}, [configData, loadConfig]);

	// Count errors per section for tab indicators
	const errorsPerSection = new Map<ConfigSection, number>();
	for (const err of validationErrors) {
		errorsPerSection.set(
			err.section,
			(errorsPerSection.get(err.section) ?? 0) + 1,
		);
	}

	const diffCount = isDirty ? getDiffs().length : 0;

	const handleApply = useCallback(async () => {
		if (!draftConfig) return;

		setIsApplying(true);
		try {
			await applyMutation.mutateAsync(draftConfig);
			toast.success("Configuration applied successfully");
			setShowReviewDialog(false);
			loadConfig(draftConfig);
		} catch {
			toast.error("Failed to apply configuration");
		} finally {
			setIsApplying(false);
		}
	}, [draftConfig, applyMutation, setIsApplying, loadConfig]);

	if (isLoading || !draftConfig) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Tab navigation with form/JSON toggle */}
			<div className="flex items-center justify-between gap-4">
				<Tabs
					value={activeSection}
					onValueChange={(v) => setActiveSection(v as ConfigSection)}
					className="flex-1"
				>
					<ScrollArea className="w-full">
						<TabsList variant="line" className="w-full justify-start">
							{CONFIG_SECTIONS.map((section) => {
								const Icon = section.icon;
								const errorCount = errorsPerSection.get(section.id) ?? 0;
								return (
									<TabsTrigger
										key={section.id}
										value={section.id}
										className="relative gap-1.5"
									>
										<Icon className="size-4" />
										<span className="hidden sm:inline">{section.label}</span>
										{errorCount > 0 && (
											<span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive" />
										)}
									</TabsTrigger>
								);
							})}
						</TabsList>
					</ScrollArea>
				</Tabs>

				<Button
					variant="outline"
					size="sm"
					onClick={toggleRawJsonMode}
					className="shrink-0"
				>
					{isRawJsonMode ? (
						<>
							<FileText className="mr-1.5 size-4" />
							Form
						</>
					) : (
						<>
							<Code className="mr-1.5 size-4" />
							JSON
						</>
					)}
				</Button>
			</div>

			{/* Validation panel */}
			<ConfigValidationPanel />

			{/* Content area */}
			<div className="min-h-[400px] rounded-lg border p-6">
				{isRawJsonMode ? (
					<ConfigRawJson />
				) : (
					<SectionForm
						section={activeSection}
						config={draftConfig}
						onUpdate={updateSection}
					/>
				)}
			</div>

			{/* Sticky bottom bar when dirty */}
			{isDirty && (
				<div className="sticky bottom-0 z-10 flex items-center justify-between rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
					<button
						type="button"
						onClick={() => setShowReviewDialog(true)}
						className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						{diffCount} unsaved change{diffCount !== 1 ? "s" : ""}
					</button>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={resetDraft}>
							Discard
						</Button>
						<Button onClick={() => setShowReviewDialog(true)}>
							Review & Apply
						</Button>
					</div>
				</div>
			)}

			{/* Review & Apply dialog */}
			<Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Review Changes</DialogTitle>
						<DialogDescription>
							Review the following changes before applying to the gateway
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh]">
						<ConfigDiffViewer />
					</ScrollArea>
					{validationErrors.length > 0 && (
						<div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
							<Badge variant="destructive">
								{validationErrors.length} error{validationErrors.length !== 1 ? "s" : ""}
							</Badge>
							<p className="text-sm text-destructive">
								Fix validation errors before applying
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowReviewDialog(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleApply}
							disabled={isApplying || validationErrors.length > 0}
						>
							{isApplying ? (
								<>
									<Loader2 className="mr-1.5 size-4 animate-spin" />
									Applying...
								</>
							) : (
								"Apply Changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
