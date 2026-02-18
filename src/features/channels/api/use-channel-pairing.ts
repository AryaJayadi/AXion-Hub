"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";
import { usePairingStore } from "../model/pairing-store";

/**
 * Mutation that simulates initiating a channel pairing flow.
 * For WhatsApp: generates a mock QR code string and sets expiration.
 * For others: resolves immediately.
 */
export function useInitiatePairing() {
	const startPairing = usePairingStore((s) => s.startPairing);
	const platform = usePairingStore((s) => s.platform);

	return useMutation({
		mutationFn: async () => {
			if (platform === "whatsapp") {
				startPairing();
				// Wait for the simulated generation
				await new Promise((resolve) => setTimeout(resolve, 1200));
				return { type: "qr" as const };
			}
			// For non-WhatsApp platforms, no special init needed
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { type: "token" as const };
		},
	});
}

/**
 * Mutation that simulates completing the channel pairing.
 * 1s delay, invalidates channels queries, shows success toast, returns new channel ID.
 */
export function useCompletePairing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const newChannelId = `ch-${Date.now().toString(36)}`;
			return { channelId: newChannelId };
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
			toast.success("Channel paired successfully", {
				description: `Channel ${data.channelId} is now connected.`,
			});
		},
		onError: () => {
			toast.error("Pairing failed", {
				description: "Could not complete channel pairing. Please try again.",
			});
		},
	});
}
