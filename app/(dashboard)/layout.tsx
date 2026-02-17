export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen">
			{/* Sidebar and topbar will be added in Phase 2 */}
			<main className="flex-1">{children}</main>
		</div>
	);
}
