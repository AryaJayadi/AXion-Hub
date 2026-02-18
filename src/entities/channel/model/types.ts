/** Supported channel platforms */
export type ChannelPlatform =
	| "whatsapp"
	| "telegram"
	| "discord"
	| "slack"
	| "web"
	| "sms";

/** Channel connection status */
export type ChannelStatus = "connected" | "disconnected" | "pairing" | "error";

/** A messaging channel connected to the gateway */
export interface Channel {
	id: string;
	name: string;
	platform: ChannelPlatform;
	status: ChannelStatus;
	agentId: string | null; // null when unrouted
	phoneNumber?: string | undefined; // whatsapp, sms
	username?: string | undefined; // telegram, discord, slack
	connectedAt: Date | null;
	messageCount: number;
}

/** Channel-to-agent routing rule */
export interface ChannelRouting {
	channelId: string;
	agentId: string;
	rule: string; // human-readable description
	priority: number;
}

/** Group channel settings (for Discord/Slack group channels) */
export interface ChannelGroupSettings {
	allowlist: string[];
	mentionPatterns: string[];
	broadcastEnabled: boolean;
}

/** QR code pairing state machine */
export type PairingStatus =
	| "idle"
	| "generating"
	| "waiting"
	| "scanned"
	| "connected"
	| "error";

/** State for channel pairing flow (e.g., WhatsApp QR scanning) */
export interface PairingState {
	status: PairingStatus;
	qrCode: string | null;
	platform: ChannelPlatform | null;
	expiresAt: Date | null;
}
