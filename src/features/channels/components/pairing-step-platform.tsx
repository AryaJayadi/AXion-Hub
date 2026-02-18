"use client";

import {
	MessageSquare,
	Send,
	Hash,
	Globe,
	Smartphone,
	type LucideIcon,
} from "lucide-react";
import type { ChannelPlatform } from "@/entities/channel";
import { cn } from "@/shared/lib/cn";
import { usePairingStore } from "../model/pairing-store";

interface PlatformOption {
	platform: ChannelPlatform;
	name: string;
	description: string;
	icon: LucideIcon;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
	{
		platform: "whatsapp",
		name: "WhatsApp",
		description: "Connect via QR code scanning",
		icon: MessageSquare,
	},
	{
		platform: "telegram",
		name: "Telegram",
		description: "Connect using a bot token",
		icon: Send,
	},
	{
		platform: "discord",
		name: "Discord",
		description: "Connect using a bot token",
		icon: Hash,
	},
	{
		platform: "slack",
		name: "Slack",
		description: "Connect via OAuth integration",
		icon: Hash,
	},
	{
		platform: "web",
		name: "Web Chat",
		description: "Embed chat on your website",
		icon: Globe,
	},
	{
		platform: "sms",
		name: "SMS",
		description: "Connect via Twilio credentials",
		icon: Smartphone,
	},
];

export function PairingStepPlatform() {
	const setPlatform = usePairingStore((s) => s.setPlatform);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{PLATFORM_OPTIONS.map((option) => {
				const Icon = option.icon;

				return (
					<button
						key={option.platform}
						type="button"
						onClick={() => setPlatform(option.platform)}
						className={cn(
							"group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all",
							"hover:border-primary hover:shadow-md cursor-pointer",
						)}
					>
						<div className="flex size-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
							<Icon className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
						</div>
						<div>
							<h3 className="text-sm font-semibold text-foreground">
								{option.name}
							</h3>
							<p className="mt-1 text-xs text-muted-foreground">
								{option.description}
							</p>
						</div>
					</button>
				);
			})}
		</div>
	);
}
