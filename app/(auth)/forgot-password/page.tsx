import { AuthLayout } from "@/features/auth/components/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
	title: "Forgot Password - AXion Hub",
	description: "Reset your AXion Hub password",
};

export default function ForgotPasswordPage() {
	return (
		<AuthLayout
			heading="Forgot your password?"
			description="Enter your email and we'll send you a reset link"
		>
			<ForgotPasswordForm />
		</AuthLayout>
	);
}
