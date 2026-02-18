import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

interface AuthLayoutProps {
	heading: string;
	description: string;
	children: React.ReactNode;
}

export function AuthLayout({ heading, description, children }: AuthLayoutProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			{/* Left side - Branding (hidden on mobile) */}
			<div className="bg-muted relative hidden lg:block">
				<div className="absolute inset-0 bg-gradient-to-br from-neutral-950 to-neutral-900" />
				<div
					className="absolute inset-0 opacity-[0.05]"
					style={{
						backgroundImage:
							"repeating-linear-gradient(0deg, transparent, transparent 49px, currentColor 49px, currentColor 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, currentColor 49px, currentColor 50px)",
					}}
				/>
				<div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-white">
					<div className="flex size-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<GalleryVerticalEnd className="size-8" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight">AXion Hub</h1>
					<p className="text-lg text-neutral-400">
						Mission Control for AI Agents
					</p>
				</div>
			</div>

			{/* Right side - Form */}
			<div className="flex flex-col">
				{/* Top: Logo + name (mobile + desktop) */}
				<div className="flex items-center gap-2 p-6 md:p-8">
					<Link href="/" className="flex items-center gap-2 font-semibold">
						<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<GalleryVerticalEnd className="size-4" />
						</div>
						AXion Hub
					</Link>
				</div>

				{/* Center: Heading + Form */}
				<div className="flex flex-1 items-center justify-center px-6 pb-12">
					<div className="w-full max-w-sm space-y-6">
						<div className="space-y-2 text-center">
							<h2 className="text-2xl font-bold">{heading}</h2>
							<p className="text-muted-foreground text-sm text-balance">
								{description}
							</p>
						</div>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
