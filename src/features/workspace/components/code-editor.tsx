"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Extension } from "@codemirror/state";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Dynamic import of @uiw/react-codemirror with SSR disabled.
 *
 * CRITICAL: CodeMirror accesses document/window at import time.
 * Must be loaded client-side only (Pitfall 1 from research).
 */
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
	ssr: false,
	loading: () => <Skeleton className="h-full w-full" />,
});

/**
 * Lazy language extension loader.
 *
 * Each language is dynamically imported to avoid bundling all languages
 * into the main chunk (Pitfall 2 from research).
 */
async function getLanguageExtension(ext: string): Promise<Extension | null> {
	switch (ext) {
		case "ts":
		case "tsx":
			return import("@codemirror/lang-javascript").then((m) =>
				m.javascript({ typescript: true, jsx: ext === "tsx" }),
			);
		case "js":
		case "jsx":
			return import("@codemirror/lang-javascript").then((m) =>
				m.javascript({ jsx: ext === "jsx" }),
			);
		case "json":
			return import("@codemirror/lang-json").then((m) => m.json());
		case "md":
		case "mdx":
			return import("@codemirror/lang-markdown").then((m) => m.markdown());
		case "py":
			return import("@codemirror/lang-python").then((m) => m.python());
		case "yaml":
		case "yml":
			return import("@codemirror/lang-yaml").then((m) => m.yaml());
		default:
			return null;
	}
}

interface CodeEditorProps {
	/** File content. */
	value: string;
	/** File path (used for language detection from extension). */
	filePath: string;
	/** Called on every content change. */
	onChange?: ((value: string) => void) | undefined;
	/** Called with debounced content for auto-save. */
	onSave?: ((content: string) => Promise<void>) | undefined;
	/** Whether the editor is read-only. */
	readOnly?: boolean | undefined;
}

/**
 * CodeMirror-based code editor with syntax highlighting and auto-save.
 *
 * Features:
 * - Lazy-loaded language extensions based on file extension
 * - Dark mode sync via next-themes
 * - Auto-save with 500ms debounce (follows AgentIdentityEditor pattern)
 * - Line numbers, fold gutter, bracket matching, active line highlight
 * - Built-in Ctrl+F find/replace from CodeMirror
 */
export function CodeEditor({
	value,
	filePath,
	onChange,
	onSave,
	readOnly,
}: CodeEditorProps) {
	const { resolvedTheme } = useTheme();
	const [langExt, setLangExt] = useState<Extension | null>(null);
	const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

	// Load language extension when file extension changes
	useEffect(() => {
		let cancelled = false;
		getLanguageExtension(ext).then((extension) => {
			if (!cancelled) setLangExt(extension);
		});
		return () => {
			cancelled = true;
		};
	}, [ext]);

	const extensions = useMemo(() => {
		const exts: Extension[] = [];
		if (langExt) exts.push(langExt);
		return exts;
	}, [langExt]);

	// Debounced auto-save (follows AgentIdentityEditor pattern)
	const debouncedSave = useDebouncedCallback(async (content: string) => {
		if (onSave) await onSave(content);
	}, 500);

	// Cleanup on unmount: flush pending save
	useEffect(() => {
		return () => {
			debouncedSave.flush();
			if (savedTimerRef.current) {
				clearTimeout(savedTimerRef.current);
			}
		};
	}, [debouncedSave]);

	const handleChange = (val: string) => {
		onChange?.(val);
		debouncedSave(val);
	};

	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	return (
		<div data-color-mode={colorMode} className="h-full">
			<CodeMirror
				value={value}
				extensions={extensions}
				{...(readOnly ? { readOnly: true } : { onChange: handleChange })}
				height="100%"
				basicSetup={{
					lineNumbers: true,
					foldGutter: true,
					bracketMatching: true,
					highlightActiveLine: true,
					searchKeymap: true,
					tabSize: 2,
				}}
				theme={colorMode}
			/>
		</div>
	);
}
