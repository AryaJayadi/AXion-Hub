import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { apiKey, organization, twoFactor } from "better-auth/plugins";
import { db } from "@/shared/lib/db";
import * as authSchema from "@/entities/user/model/auth-schema";
import { sendEmail } from "./email";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,

	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: "Reset your password",
				html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${url}">Reset Password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
			});
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: "Verify your email address",
				html: `<p>Hi ${user.name},</p><p>Click the link below to verify your email address:</p><p><a href="${url}">Verify Email</a></p>`,
			});
		},
		autoSignInAfterVerification: true,
	},

	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			prompt: "select_account",
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Refresh after 1 day
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

	plugins: [
		nextCookies(),
		twoFactor({
			issuer: "AXion Hub",
		}),
		apiKey({
			defaultPrefix: "axion_",
			startingCharactersConfig: {
				shouldStore: true,
				charactersLength: 4,
			},
		}),
		organization({
			allowUserToCreateOrganization: true,
			creatorRole: "owner",
			sendInvitationEmail: async (data) => {
				const inviteLink = `${process.env.BETTER_AUTH_URL}/invite/${data.id}`;
				void sendEmail({
					to: data.email,
					subject: `You've been invited to ${data.organization.name}`,
					html: `<p>You've been invited to join <strong>${data.organization.name}</strong>.</p><p><a href="${inviteLink}">Accept Invitation</a></p>`,
				});
			},
		}),
	],

	// Auto-create personal organization after user registration
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					try {
						await auth.api.createOrganization({
							body: {
								name: `${user.name}'s Workspace`,
								slug: `personal-${user.id}`,
							},
							headers: new Headers({ "x-user-id": user.id }),
						});
					} catch (error) {
						// Non-blocking: if org creation fails, user can create one manually.
						// This can happen if better-auth hook context is incomplete.
						console.error(
							"[Auth] Failed to auto-create personal organization:",
							error,
						);
					}
				},
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
