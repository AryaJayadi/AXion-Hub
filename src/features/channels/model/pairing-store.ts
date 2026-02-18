import { create } from "zustand";
import type { ChannelPlatform, PairingStatus } from "@/entities/channel";

interface PairingStoreState {
	currentStep: number;
	platform: ChannelPlatform | null;
	pairingState: PairingStatus;
	qrCode: string | null;
	qrExpiresAt: Date | null;
	authData: { botToken?: string; oauthCode?: string } | null;
	channelConfig: { name: string; agentId: string | null } | null;
	error: string | null;

	// Actions
	setPlatform: (platform: ChannelPlatform) => void;
	setStep: (step: number) => void;
	startPairing: () => void;
	simulateQrScan: () => void;
	setAuthData: (data: { botToken?: string; oauthCode?: string }) => void;
	setChannelConfig: (config: { name: string; agentId: string | null }) => void;
	resetWizard: () => void;
}

const initialState = {
	currentStep: 0,
	platform: null as ChannelPlatform | null,
	pairingState: "idle" as PairingStatus,
	qrCode: null as string | null,
	qrExpiresAt: null as Date | null,
	authData: null as { botToken?: string; oauthCode?: string } | null,
	channelConfig: null as { name: string; agentId: string | null } | null,
	error: null as string | null,
};

export const usePairingStore = create<PairingStoreState>()((set, get) => ({
	...initialState,

	setPlatform: (platform) =>
		set({ platform, currentStep: 1 }),

	setStep: (step) => {
		const { currentStep } = get();
		// Only allow navigating backwards or to same step
		if (step <= currentStep) {
			set({ currentStep: step });
		}
	},

	startPairing: () => {
		set({ pairingState: "generating" });
		setTimeout(() => {
			set({
				pairingState: "waiting",
				qrCode: "MOCK_QR_DATA_AXION_HUB_WHATSAPP_PAIRING_2026",
				qrExpiresAt: new Date(Date.now() + 60_000),
			});
		}, 1000);
	},

	simulateQrScan: () => {
		set({ pairingState: "scanned" });
		setTimeout(() => {
			set({ pairingState: "connected" });
		}, 1000);
	},

	setAuthData: (data) => set({ authData: data }),

	setChannelConfig: (config) => set({ channelConfig: config }),

	resetWizard: () => set(initialState),
}));
