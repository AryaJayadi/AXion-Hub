"use client";

import { createAuthClient } from "better-auth/react";
import {
	apiKeyClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [organizationClient(), twoFactorClient(), apiKeyClient()],
});

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	useActiveOrganization,
	useListOrganizations,
	organization,
	twoFactor,
	apiKey,
} = authClient;
