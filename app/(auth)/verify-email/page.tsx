import { Suspense } from "react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyEmailContent } from "./verify-email-content";

export const metadata = {
	title: "Verify Email - AXion Hub",
	description: "Verify your AXion Hub email address",
};

export default function VerifyEmailPage() {
	return (
		<AuthLayout
			heading="Verify your email"
			description="Complete your account setup"
		>
			<Suspense>
				<VerifyEmailContent />
			</Suspense>
		</AuthLayout>
	);
}
