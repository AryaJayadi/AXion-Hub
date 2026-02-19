"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface DocRendererProps {
	title: string;
	content: string;
}

export function DocRenderer({ title, content }: DocRendererProps) {
	const { resolvedTheme } = useTheme();

	return (
		<article className="max-w-none">
			<h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
				{title}
			</h1>

			<div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
				<MDEditor
					value={content}
					preview="preview"
					visibleDragbar={false}
					height="100%"
					hideToolbar
					style={{ background: "transparent" }}
				/>
			</div>
		</article>
	);
}
