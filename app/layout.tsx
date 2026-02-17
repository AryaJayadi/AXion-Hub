import type { Metadata } from "next";
import { JetBrains_Mono, Merriweather, Outfit } from "next/font/google";
import { AppProviders } from "@/app/providers/app-providers";
import "@/app/styles/globals.css";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	display: "swap",
});

const merriweather = Merriweather({
	variable: "--font-merriweather",
	subsets: ["latin"],
	weight: ["300", "400", "700", "900"],
	display: "swap",
});

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
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${outfit.variable} ${jetbrainsMono.variable} ${merriweather.variable} font-sans antialiased bg-background text-foreground`}
			>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
