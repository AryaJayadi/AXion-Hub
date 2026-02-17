export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			<h1 className="text-5xl font-bold text-primary">AXion Hub</h1>
			<p className="text-lg text-muted-foreground">AI Agent Mission Control</p>
			<div className="mt-8 flex gap-4">
				<span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
					Primary
				</span>
				<span className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
					Secondary
				</span>
				<span className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">
					Destructive
				</span>
			</div>
		</main>
	);
}
