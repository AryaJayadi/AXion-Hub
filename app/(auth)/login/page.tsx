import { Suspense } from "react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
	title: "Sign In - AXion Hub",
	description: "Sign in to your AXion Hub account",
};

export default function LoginPage() {
	return (
		<AuthLayout
			heading="Welcome back"
			description="Sign in to your AXion Hub account"
		>
			<Suspense>
				<LoginForm />
			</Suspense>
		</AuthLayout>
	);
}
