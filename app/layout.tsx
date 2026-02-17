import type { Metadata } from "next";
import "@/app/styles/globals.css";

export const metadata: Metadata = {
	title: "AXion Hub",
	description: "AI Agent Mission Control",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased bg-background text-foreground">{children}</body>
		</html>
	);
}
