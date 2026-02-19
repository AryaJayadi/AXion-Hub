"use client";

/**
 * HTTP Request node -- makes an HTTP request to an external API.
 *
 * Shows method + URL. Standard handles.
 */

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseWorkflowNode } from "./base-workflow-node";

const METHOD_COLORS: Record<string, string> = {
	GET: "text-green-600 dark:text-green-400",
	POST: "text-blue-600 dark:text-blue-400",
	PUT: "text-amber-600 dark:text-amber-400",
	DELETE: "text-red-600 dark:text-red-400",
};

function HttpRequestNodeComponent({ id, data, selected }: NodeProps) {
	const method = (data.method as string) ?? "GET";
	const url = (data.url as string) || "https://...";

	return (
		<BaseWorkflowNode
			id={id}
			data={data as Record<string, unknown>}
			selected={selected}
			nodeType="httpRequest"
		>
			<div className="flex items-center gap-1.5">
				<span
					className={`text-xs font-bold ${METHOD_COLORS[method] ?? "text-muted-foreground"}`}
				>
					{method}
				</span>
				<span className="text-xs text-muted-foreground truncate max-w-[140px]">
					{url}
				</span>
			</div>
		</BaseWorkflowNode>
	);
}

export const HttpRequestNode = memo(HttpRequestNodeComponent);
