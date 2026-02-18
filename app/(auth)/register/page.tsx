import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
	title: "Create Account - AXion Hub",
	description: "Create your AXion Hub account",
};

export default function RegisterPage() {
	return (
		<AuthLayout
			heading="Create an account"
			description="Get started with AXion Hub"
		>
			<RegisterForm />
		</AuthLayout>
	);
}
