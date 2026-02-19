import { create } from "zustand";
import type { PluginInstallProgress, PluginInstallStatus } from "@/entities/plugin";

interface PluginInstallState {
	/** Active installation progress by plugin ID */
	installs: Map<string, PluginInstallProgress>;
	/** Start tracking a new install */
	startInstall: (pluginId: string, name: string) => void;
	/** Update progress for an active install */
	updateProgress: (pluginId: string, status: PluginInstallStatus, progress: number) => void;
	/** Mark install as complete */
	completeInstall: (pluginId: string) => void;
	/** Mark install as failed */
	failInstall: (pluginId: string, error: string) => void;
	/** Remove install tracking entry */
	clearInstall: (pluginId: string) => void;
}

export const usePluginInstallStore = create<PluginInstallState>((set) => ({
	installs: new Map(),

	startInstall: (pluginId, name) => {
		set((state) => {
			const next = new Map(state.installs);
			next.set(pluginId, {
				pluginId,
				name,
				status: "downloading",
				progress: 0,
				error: null,
			});
			return { installs: next };
		});
	},

	updateProgress: (pluginId, status, progress) => {
		set((state) => {
			const existing = state.installs.get(pluginId);
			if (!existing) return state;
			const next = new Map(state.installs);
			next.set(pluginId, { ...existing, status, progress });
			return { installs: next };
		});
	},

	completeInstall: (pluginId) => {
		set((state) => {
			const existing = state.installs.get(pluginId);
			if (!existing) return state;
			const next = new Map(state.installs);
			next.set(pluginId, { ...existing, status: "complete", progress: 100 });
			return { installs: next };
		});
	},

	failInstall: (pluginId, error) => {
		set((state) => {
			const existing = state.installs.get(pluginId);
			if (!existing) return state;
			const next = new Map(state.installs);
			next.set(pluginId, { ...existing, status: "error", error });
			return { installs: next };
		});
	},

	clearInstall: (pluginId) => {
		set((state) => {
			const next = new Map(state.installs);
			next.delete(pluginId);
			return { installs: next };
		});
	},
}));
