import { create } from "zustand";
import type { SkillConfig } from "@/entities/skill";

export interface SkillConfigValidationError {
	path: string;
	message: string;
}

interface SkillConfigStore {
	/** The skill ID currently being configured */
	skillId: string | null;
	/** Loaded config from server, read-only reference */
	originalConfig: SkillConfig | null;
	/** Mutable copy being edited */
	draftConfig: SkillConfig | null;
	/** True when draft differs from original */
	isDirty: boolean;
	/** Toggle between form and raw JSON editor */
	isRawJsonMode: boolean;
	/** JSON parse or validation errors */
	validationErrors: SkillConfigValidationError[];

	// Actions
	loadConfig: (skillId: string, config: SkillConfig) => void;
	updateField: (dotPath: string, value: unknown) => void;
	updateFromRawJson: (json: string) => boolean;
	toggleRawJsonMode: () => void;
	resetDraft: () => void;
	getDraftJson: () => string;
}

/**
 * Set a value at a dot-separated path in an object.
 * E.g. setByDotPath(obj, "a.b.c", 42) sets obj.a.b.c = 42
 */
function setByDotPath(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> {
	const clone = structuredClone(obj);
	const parts = path.split(".");
	let current: Record<string, unknown> = clone;

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i] as string;
		if (
			typeof current[part] !== "object" ||
			current[part] === null
		) {
			current[part] = {};
		}
		current = current[part] as Record<string, unknown>;
	}

	const lastPart = parts[parts.length - 1] as string;
	current[lastPart] = value;
	return clone;
}

export const useSkillConfigStore = create<SkillConfigStore>((set, get) => ({
	skillId: null,
	originalConfig: null,
	draftConfig: null,
	isDirty: false,
	isRawJsonMode: false,
	validationErrors: [],

	loadConfig: (skillId, config) => {
		set({
			skillId,
			originalConfig: structuredClone(config),
			draftConfig: structuredClone(config),
			isDirty: false,
			isRawJsonMode: false,
			validationErrors: [],
		});
	},

	updateField: (dotPath, value) => {
		const { draftConfig } = get();
		if (!draftConfig) return;

		const updated = setByDotPath(
			draftConfig as Record<string, unknown>,
			dotPath,
			value,
		);

		set({
			draftConfig: updated as SkillConfig,
			isDirty: true,
			validationErrors: [],
		});
	},

	updateFromRawJson: (json) => {
		try {
			const parsed = JSON.parse(json) as SkillConfig;

			set({
				draftConfig: parsed,
				isDirty: true,
				validationErrors: [],
			});
			return true;
		} catch (e) {
			set({
				validationErrors: [
					{
						path: "",
						message:
							e instanceof Error
								? e.message
								: "Invalid JSON",
					},
				],
			});
			return false;
		}
	},

	toggleRawJsonMode: () => {
		set((state) => ({ isRawJsonMode: !state.isRawJsonMode }));
	},

	resetDraft: () => {
		const { originalConfig } = get();
		if (!originalConfig) return;

		set({
			draftConfig: structuredClone(originalConfig),
			isDirty: false,
			validationErrors: [],
		});
	},

	getDraftJson: () => {
		const { draftConfig } = get();
		return draftConfig ? JSON.stringify(draftConfig, null, 2) : "{}";
	},
}));
