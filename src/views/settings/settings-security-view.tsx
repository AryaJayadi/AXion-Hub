"use client";

import { ActiveSessionsCard } from "@/features/settings/components/active-sessions-card";
import { PasswordChangeForm } from "@/features/settings/components/password-change-form";
import { TotpSetupCard } from "@/features/settings/components/totp-setup-card";

export function SettingsSecurityView() {
	return (
		<div className="space-y-6">
			<PasswordChangeForm />
			<TotpSetupCard />
			<ActiveSessionsCard />
		</div>
	);
}
