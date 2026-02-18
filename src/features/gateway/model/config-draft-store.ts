import { create } from "zustand";
import type {
	ConfigDiff,
	ConfigSection,
	OpenClawConfig,
} from "@/entities/gateway-config";
import { computeConfigDiff } from "../lib/config-diff";
import { SECTION_SCHEMA_MAP } from "../schemas/config-schemas";

export interface ValidationError {
	path: string;
	message: string;
	section: ConfigSection;
}

interface ConfigDraftStore {
	/** Loaded from gateway, read-only reference */
	originalConfig: OpenClawConfig | null;
	/** Mutable copy being edited */
	draftConfig: OpenClawConfig | null;
	/** True when draft differs from original */
	isDirty: boolean;
	/** True during apply operation */
	isApplying: boolean;
	/** Currently selected tab */
	activeSection: ConfigSection;
	/** Toggle between form and JSON editor */
	isRawJsonMode: boolean;
	/** Zod validation errors */
	validationErrors: ValidationError[];

	// Actions
	loadConfig: (config: OpenClawConfig) => void;
	updateSection: (section: ConfigSection, values: unknown) => void;
	updateFromRawJson: (json: string) => boolean;
	setActiveSection: (section: ConfigSection) => void;
	toggleRawJsonMode: () => void;
	resetDraft: () => void;
	getDiffs: () => ConfigDiff[];
	validate: () => ValidationError[];
	setIsApplying: (v: boolean) => void;
}

const ALL_SECTIONS: ConfigSection[] = [
	"identity",
	"sessions",
	"channels",
	"models",
	"compaction",
	"memorySearch",
	"security",
	"plugins",
	"gateway",
];

function runValidation(draft: OpenClawConfig): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const section of ALL_SECTIONS) {
		const schema = SECTION_SCHEMA_MAP[section];
		const sectionData = draft[section];
		const result = schema.safeParse(sectionData);

		if (!result.success) {
			for (const issue of result.error.issues) {
				const issuePath = issue.path.map(String).join(".");
				errors.push({
					path: issuePath ? `${section}.${issuePath}` : section,
					message: issue.message,
					section,
				});
			}
		}
	}

	return errors;
}

export const useConfigDraftStore = create<ConfigDraftStore>((set, get) => ({
	originalConfig: null,
	draftConfig: null,
	isDirty: false,
	isApplying: false,
	activeSection: "identity",
	isRawJsonMode: false,
	validationErrors: [],

	loadConfig: (config) => {
		set({
			originalConfig: structuredClone(config),
			draftConfig: structuredClone(config),
			isDirty: false,
			isApplying: false,
			validationErrors: [],
		});
	},

	updateSection: (section, values) => {
		const { draftConfig } = get();
		if (!draftConfig) return;

		const updated = {
			...draftConfig,
			[section]: values,
		};
		const validationErrors = runValidation(updated);

		set({
			draftConfig: updated,
			isDirty: true,
			validationErrors,
		});
	},

	updateFromRawJson: (json) => {
		try {
			const parsed = JSON.parse(json) as OpenClawConfig;
			const validationErrors = runValidation(parsed);

			set({
				draftConfig: parsed,
				isDirty: true,
				validationErrors,
			});
			return true;
		} catch {
			return false;
		}
	},

	setActiveSection: (section) => {
		set({ activeSection: section });
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

	getDiffs: () => {
		const { originalConfig, draftConfig } = get();
		if (!originalConfig || !draftConfig) return [];

		return computeConfigDiff(
			originalConfig as unknown as Record<string, unknown>,
			draftConfig as unknown as Record<string, unknown>,
		);
	},

	validate: () => {
		const { draftConfig } = get();
		if (!draftConfig) return [];

		const errors = runValidation(draftConfig);
		set({ validationErrors: errors });
		return errors;
	},

	setIsApplying: (v) => {
		set({ isApplying: v });
	},
}));
