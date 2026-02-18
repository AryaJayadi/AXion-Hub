import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/app-shell/components/app-sidebar";
import { HeaderBar } from "@/widgets/app-shell/components/header-bar";

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const user = {
		name: session.user.name,
		email: session.user.email,
		image: session.user.image ?? null,
	};

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<HeaderBar user={user} />
				<div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
