"use client";

/**
 * Code node -- runs custom JavaScript or Python code.
 *
 * Shows language badge. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

const LANG_COLORS: Record<string, string> = {
	javascript: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	python: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function CodeNodeComponent({ id, data, selected }: NodeProps) {
	const language = (data.language as string) ?? "javascript";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="code"
		>
			<span
				className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LANG_COLORS[language] ?? "bg-muted text-muted-foreground"}`}
			>
				{language}
			</span>
		</BaseWorkflowNode>
	);
}

export const CodeNode = memo(CodeNodeComponent);
