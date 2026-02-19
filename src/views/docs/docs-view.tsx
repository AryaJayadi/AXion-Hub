import Link from "next/link";
import {
	BookOpen,
	Bot,
	Network,
	Radio,
	Code,
	Shield,
} from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/shared/ui/card";
import { DOC_CATEGORIES, getDocsByCategory } from "@/features/docs/lib/docs-content";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	"getting-started": BookOpen,
	agents: Bot,
	missions: Network,
	gateway: Radio,
	"api-reference": Code,
	administration: Shield,
};

const QUICK_LINKS = [
	{ title: "Quick Start Guide", href: "/docs/getting-started/quick-start" },
	{ title: "Creating Agents", href: "/docs/agents/creating-agents" },
	{ title: "REST API", href: "/docs/api-reference/rest-api" },
	{ title: "Connection Setup", href: "/docs/gateway/connection-setup" },
];

export function DocsView() {
	return (
		<div className="space-y-8">
			{/* Welcome */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold tracking-tight">
					Welcome to AXion Hub Documentation
				</h2>
				<p className="text-sm text-muted-foreground max-w-2xl">
					Everything you need to know about managing AI agents,
					creating missions, configuring the gateway, and using the
					developer tools. Select a topic from the sidebar or start
					with a quick link below.
				</p>
			</div>

			{/* Quick Links */}
			<div className="space-y-3">
				<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Popular Pages
				</h3>
				<div className="flex flex-wrap gap-2">
					{QUICK_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
						>
							{link.title}
						</Link>
					))}
				</div>
			</div>

			{/* Browse Categories */}
			<div className="space-y-3">
				<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Browse Categories
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{DOC_CATEGORIES.map((cat) => {
						const Icon = CATEGORY_ICONS[cat.id] ?? BookOpen;
						const pages = getDocsByCategory(cat.id);
						const firstPage = pages[0];

						return (
							<Link
								key={cat.id}
								href={
									firstPage
										? `/docs/${firstPage.slug}`
										: "/docs"
								}
							>
								<Card className="h-full transition-colors hover:bg-accent/30">
									<CardHeader className="gap-2">
										<Icon className="size-5 text-muted-foreground" />
										<CardTitle className="text-base">
											{cat.label}
										</CardTitle>
										<CardDescription>
											{pages.length} article
											{pages.length !== 1 ? "s" : ""}
										</CardDescription>
									</CardHeader>
								</Card>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
