import { Suspense } from "react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
	title: "Reset Password - AXion Hub",
	description: "Set your new AXion Hub password",
};

export default function ResetPasswordPage() {
	return (
		<AuthLayout
			heading="Reset your password"
			description="Enter your new password below"
		>
			<Suspense>
				<ResetPasswordForm />
			</Suspense>
		</AuthLayout>
	);
}
