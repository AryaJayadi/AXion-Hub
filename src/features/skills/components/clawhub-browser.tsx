"use client";

import { useMemo } from "react";
import {
	useQueryState,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs";
import type { LucideIcon } from "lucide-react";
import {
	BookOpen,
	Rocket,
	Workflow,
	WandSparkles,
	Users,
	ShieldAlert,
	FileText,
	Server,
	ArrowLeftRight,
	Brain,
	Clock,
	Lock,
	MessageCircle,
	Activity,
	Notebook,
	ImageIcon,
	FileCheck,
	Webhook,
	Puzzle,
	Download,
	Loader2,
	Star,
	TrendingUp,
} from "lucide-react";
import type { ClawHubSkill, SkillCategory } from "@/entities/skill";
import { SearchInput } from "@/shared/ui/search-input";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useInstallFromClawHub } from "../api/use-clawhub";

const ICON_MAP: Record<string, LucideIcon> = {
	"book-open": BookOpen,
	rocket: Rocket,
	workflow: Workflow,
	"wand-sparkles": WandSparkles,
	users: Users,
	"shield-alert": ShieldAlert,
	"file-text": FileText,
	server: Server,
	"arrow-left-right": ArrowLeftRight,
	brain: Brain,
	clock: Clock,
	lock: Lock,
	"message-circle": MessageCircle,
	activity: Activity,
	notebook: Notebook,
	image: ImageIcon,
	"file-check": FileCheck,
	webhook: Webhook,
	puzzle: Puzzle,
};

const CATEGORY_OPTIONS = [
	"all",
	"code",
	"communication",
	"data",
	"productivity",
	"integration",
	"security",
] as const;

type CategoryFilter = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
	all: "All",
	code: "Code",
	communication: "Communication",
	data: "Data",
	productivity: "Productivity",
	integration: "Integration",
	security: "Security",
};

function formatDownloads(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
}

interface ClawHubBrowserProps {
	skills: ClawHubSkill[];
}

export function ClawHubBrowser({ skills }: ClawHubBrowserProps) {
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [category, setCategory] = useQueryState(
		"category",
		parseAsStringLiteral(CATEGORY_OPTIONS).withDefault("all"),
	);

	const installMutation = useInstallFromClawHub();

	const featuredSkills = useMemo(
		() => skills.filter((s) => s.featured),
		[skills],
	);

	const trendingSkills = useMemo(
		() => skills.filter((s) => s.trending),
		[skills],
	);

	const filteredSkills = useMemo(() => {
		let result = skills;

		if (category !== "all") {
			result = result.filter(
				(s) => s.category === (category as SkillCategory),
			);
		}

		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				(s) =>
					s.name.toLowerCase().includes(q) ||
					s.description.toLowerCase().includes(q) ||
					s.author.toLowerCase().includes(q),
			);
		}

		return result;
	}, [skills, category, search]);

	const handleInstall = (skillId: string) => {
		installMutation.mutate(skillId);
	};

	return (
		<div className="space-y-6">
			{/* Search */}
			<SearchInput
				value={search}
				onChange={setSearch}
				placeholder="Search skills by name, description, or author..."
				className="max-w-md"
			/>

			{/* Category tabs */}
			<Tabs
				value={category}
				onValueChange={(v) => setCategory(v as CategoryFilter)}
			>
				<TabsList variant="line">
					{CATEGORY_OPTIONS.map((cat) => (
						<TabsTrigger key={cat} value={cat}>
							{CATEGORY_LABELS[cat]}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{/* Featured section */}
			{category === "all" && !search && featuredSkills.length > 0 && (
				<section>
					<div className="mb-3 flex items-center gap-2">
						<Star className="size-4 text-yellow-500" />
						<h2 className="text-sm font-semibold">Featured</h2>
					</div>
					<ScrollArea className="w-full">
						<div className="flex gap-4 pb-4">
							{featuredSkills.map((skill) => (
								<FeaturedCard
									key={skill.id}
									skill={skill}
									onInstall={handleInstall}
									isInstalling={
										installMutation.isPending &&
										installMutation.variables === skill.id
									}
								/>
							))}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</section>
			)}

			{/* Trending section */}
			{category === "all" && !search && trendingSkills.length > 0 && (
				<section>
					<div className="mb-3 flex items-center gap-2">
						<TrendingUp className="size-4 text-primary" />
						<h2 className="text-sm font-semibold">Trending</h2>
					</div>
					<ScrollArea className="w-full">
						<div className="flex gap-4 pb-4">
							{trendingSkills.map((skill) => (
								<FeaturedCard
									key={skill.id}
									skill={skill}
									onInstall={handleInstall}
									isInstalling={
										installMutation.isPending &&
										installMutation.variables === skill.id
									}
								/>
							))}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</section>
			)}

			{/* Main grid */}
			<section>
				<h2 className="mb-3 text-sm font-semibold">
					{category === "all" ? "All Skills" : CATEGORY_LABELS[category]}{" "}
					<span className="font-normal text-muted-foreground">
						({filteredSkills.length})
					</span>
				</h2>
				{filteredSkills.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No skills found matching your search.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredSkills.map((skill) => {
							const Icon = ICON_MAP[skill.icon] ?? Puzzle;
							const isInstalling =
								installMutation.isPending &&
								installMutation.variables === skill.id;

							return (
								<div
									key={skill.id}
									className="flex flex-col gap-3 rounded-lg border bg-card p-4"
								>
									<div className="flex items-start gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
											<Icon className="size-5 text-muted-foreground" />
										</div>
										<div className="min-w-0 flex-1">
											<h3 className="truncate text-sm font-semibold">
												{skill.name}
											</h3>
											<p className="text-xs text-muted-foreground">
												by {skill.author}
											</p>
										</div>
									</div>
									<p className="line-clamp-2 text-xs text-muted-foreground">
										{skill.description}
									</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3 text-xs text-muted-foreground">
											<span>{formatDownloads(skill.downloads)} downloads</span>
											<span className="flex items-center gap-0.5">
												<Star className="size-3 fill-yellow-500 text-yellow-500" />
												{skill.rating.toFixed(1)}
											</span>
										</div>
										<Button
											size="sm"
											variant={skill.installed ? "outline" : "default"}
											disabled={skill.installed || isInstalling}
											onClick={() => handleInstall(skill.id)}
										>
											{isInstalling ? (
												<Loader2 className="size-3.5 animate-spin" />
											) : skill.installed ? (
												"Installed"
											) : (
												<>
													<Download className="mr-1 size-3.5" />
													Install
												</>
											)}
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}

/** Larger featured/trending card with more detail */
function FeaturedCard({
	skill,
	onInstall,
	isInstalling,
}: {
	skill: ClawHubSkill;
	onInstall: (id: string) => void;
	isInstalling: boolean;
}) {
	const Icon = ICON_MAP[skill.icon] ?? Puzzle;

	return (
		<div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border bg-card p-4">
			<div className="flex items-start gap-3">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
					<Icon className="size-6 text-muted-foreground" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<h3 className="truncate text-sm font-semibold">
							{skill.name}
						</h3>
						{skill.featured && (
							<Badge variant="secondary" className="text-[10px]">
								Featured
							</Badge>
						)}
						{skill.trending && (
							<Badge variant="outline" className="text-[10px]">
								Trending
							</Badge>
						)}
					</div>
					<p className="text-xs text-muted-foreground">
						by {skill.author} &middot; v{skill.version}
					</p>
				</div>
			</div>
			<p className="line-clamp-2 text-xs text-muted-foreground">
				{skill.description}
			</p>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>{formatDownloads(skill.downloads)}</span>
					<span className="flex items-center gap-0.5">
						<Star className="size-3 fill-yellow-500 text-yellow-500" />
						{skill.rating.toFixed(1)}
					</span>
				</div>
				<Button
					size="sm"
					variant={skill.installed ? "outline" : "default"}
					disabled={skill.installed || isInstalling}
					onClick={() => onInstall(skill.id)}
				>
					{isInstalling ? (
						<Loader2 className="size-3.5 animate-spin" />
					) : skill.installed ? (
						"Installed"
					) : (
						<>
							<Download className="mr-1 size-3.5" />
							Install
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
