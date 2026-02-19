"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Code, FileText, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import type { SkillConfig } from "@/entities/skill";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useSkillConfigStore } from "../model/skill-config-store";
import { useUpdateSkillConfig } from "../api/use-skill-detail";

/**
 * Dynamic import of CodeMirror with SSR disabled.
 * Same pattern as workspace code-editor.tsx.
 */
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
	ssr: false,
	loading: () => <Skeleton className="h-64 w-full" />,
});

/** Lazy load JSON language extension */
async function getJsonExtension() {
	const { json } = await import("@codemirror/lang-json");
	return json();
}

interface SkillConfigEditorProps {
	skillId: string;
	config: SkillConfig | null;
}

export function SkillConfigEditor({
	skillId,
	config,
}: SkillConfigEditorProps) {
	const { resolvedTheme } = useTheme();
	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	const loadConfig = useSkillConfigStore((s) => s.loadConfig);
	const draftConfig = useSkillConfigStore((s) => s.draftConfig);
	const isDirty = useSkillConfigStore((s) => s.isDirty);
	const isRawJsonMode = useSkillConfigStore((s) => s.isRawJsonMode);
	const toggleRawJsonMode = useSkillConfigStore((s) => s.toggleRawJsonMode);
	const resetDraft = useSkillConfigStore((s) => s.resetDraft);
	const updateField = useSkillConfigStore((s) => s.updateField);
	const updateFromRawJson = useSkillConfigStore((s) => s.updateFromRawJson);
	const getDraftJson = useSkillConfigStore((s) => s.getDraftJson);
	const validationErrors = useSkillConfigStore((s) => s.validationErrors);

	const updateConfigMutation = useUpdateSkillConfig();

	// Load config into store when data arrives or skillId changes
	useEffect(() => {
		if (config) {
			loadConfig(skillId, config);
		}
	}, [config, skillId, loadConfig]);

	// JSON language extension
	const [jsonExt, setJsonExt] = useState<Awaited<
		ReturnType<typeof getJsonExtension>
	> | null>(null);
	useEffect(() => {
		let cancelled = false;
		getJsonExtension().then((ext) => {
			if (!cancelled) setJsonExt(ext);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const extensions = useMemo(() => (jsonExt ? [jsonExt] : []), [jsonExt]);

	// Debounced JSON sync from CodeMirror
	const debouncedJsonUpdate = useDebouncedCallback((value: string) => {
		updateFromRawJson(value);
	}, 500);

	// Track local raw JSON for CodeMirror (avoids re-render loop)
	const jsonRef = useRef(getDraftJson());
	const [localJson, setLocalJson] = useState(getDraftJson());

	// Sync local JSON when switching modes or resetting
	useEffect(() => {
		if (isRawJsonMode) {
			const json = getDraftJson();
			jsonRef.current = json;
			setLocalJson(json);
		}
	}, [isRawJsonMode, getDraftJson]);

	const handleJsonChange = (value: string) => {
		jsonRef.current = value;
		setLocalJson(value);
		debouncedJsonUpdate(value);
	};

	const handleSave = useCallback(async () => {
		if (!draftConfig) return;

		try {
			await updateConfigMutation.mutateAsync({
				skillId,
				config: draftConfig,
			});
			toast.success("Configuration saved");
			loadConfig(skillId, draftConfig);
		} catch {
			toast.error("Failed to save configuration");
		}
	}, [draftConfig, skillId, updateConfigMutation, loadConfig]);

	if (!config) {
		return (
			<div className="rounded-lg border p-6">
				<p className="text-sm text-muted-foreground">
					This skill has no configurable options.
				</p>
			</div>
		);
	}

	if (!draftConfig) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with mode toggle */}
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold">Configuration</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={toggleRawJsonMode}
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

			{/* Validation errors */}
			{validationErrors.length > 0 && (
				<div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
					{validationErrors.map((err) => (
						<p
							key={err.path + err.message}
							className="text-xs text-destructive"
						>
							{err.path ? `${err.path}: ` : ""}
							{err.message}
						</p>
					))}
				</div>
			)}

			{/* Content area */}
			<div className="min-h-[200px] rounded-lg border p-4">
				{isRawJsonMode ? (
					<div data-color-mode={colorMode}>
						<CodeMirror
							value={localJson}
							extensions={extensions}
							onChange={handleJsonChange}
							height="300px"
							basicSetup={{
								lineNumbers: true,
								foldGutter: true,
								bracketMatching: true,
								highlightActiveLine: true,
								tabSize: 2,
							}}
							theme={colorMode}
						/>
					</div>
				) : (
					<FormFields
						config={draftConfig}
						onUpdateField={updateField}
					/>
				)}
			</div>

			{/* Dirty indicator + save/reset */}
			{isDirty && (
				<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
					<p className="text-xs text-muted-foreground">
						Unsaved changes
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={resetDraft}
						>
							<RotateCcw className="mr-1.5 size-3.5" />
							Reset
						</Button>
						<Button
							size="sm"
							onClick={handleSave}
							disabled={
								updateConfigMutation.isPending ||
								validationErrors.length > 0
							}
						>
							{updateConfigMutation.isPending ? (
								<Loader2 className="mr-1.5 size-3.5 animate-spin" />
							) : (
								<Save className="mr-1.5 size-3.5" />
							)}
							Save
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

/** Render form fields for each config key based on value type */
function FormFields({
	config,
	onUpdateField,
}: {
	config: SkillConfig;
	onUpdateField: (path: string, value: unknown) => void;
}) {
	const entries = Object.entries(config);

	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No configuration fields available.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map(([key, value]) => {
				const label = key
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (s) => s.toUpperCase());

				if (typeof value === "boolean") {
					return (
						<div
							key={key}
							className="flex items-center justify-between"
						>
							<Label htmlFor={`config-${key}`}>
								{label}
							</Label>
							<Switch
								id={`config-${key}`}
								checked={value}
								onCheckedChange={(checked) =>
									onUpdateField(key, checked)
								}
							/>
						</div>
					);
				}

				if (typeof value === "number") {
					return (
						<div key={key} className="space-y-1.5">
							<Label htmlFor={`config-${key}`}>
								{label}
							</Label>
							<Input
								id={`config-${key}`}
								type="number"
								value={value}
								onChange={(e) =>
									onUpdateField(
										key,
										Number(e.target.value),
									)
								}
							/>
						</div>
					);
				}

				if (typeof value === "string") {
					// Special handling for known select fields
					if (
						key === "severity" ||
						key === "dialect" ||
						key === "framework" ||
						key === "provider" ||
						key === "syncDirection"
					) {
						const options = getSelectOptions(key);
						return (
							<div key={key} className="space-y-1.5">
								<Label htmlFor={`config-${key}`}>
									{label}
								</Label>
								<Select
									value={value}
									onValueChange={(v) =>
										onUpdateField(key, v)
									}
								>
									<SelectTrigger id={`config-${key}`}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{options.map((opt) => (
											<SelectItem
												key={opt}
												value={opt}
											>
												{opt}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						);
					}

					return (
						<div key={key} className="space-y-1.5">
							<Label htmlFor={`config-${key}`}>
								{label}
							</Label>
							<Input
								id={`config-${key}`}
								value={value}
								onChange={(e) =>
									onUpdateField(key, e.target.value)
								}
							/>
						</div>
					);
				}

				// For arrays and objects, show as read-only JSON
				return (
					<div key={key} className="space-y-1.5">
						<Label>{label}</Label>
						<pre className="rounded-md bg-muted p-2 text-xs">
							{JSON.stringify(value, null, 2)}
						</pre>
					</div>
				);
			})}
		</div>
	);
}

/** Get select options for known config fields */
function getSelectOptions(key: string): string[] {
	switch (key) {
		case "severity":
			return ["error", "warning", "info"];
		case "dialect":
			return ["postgresql", "mysql", "sqlite"];
		case "framework":
			return ["vitest", "jest", "mocha"];
		case "provider":
			return ["google", "outlook", "caldav"];
		case "syncDirection":
			return ["bidirectional", "push", "pull"];
		default:
			return [];
	}
}
