"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input";

interface SearchInputProps {
	/** Current search value */
	value: string;
	/** Debounced change handler */
	onChange: (value: string) => void;
	/** Placeholder text */
	placeholder?: string | undefined;
	/** Debounce delay in milliseconds */
	debounceMs?: number | undefined;
	/** Additional class names */
	className?: string | undefined;
}

function SearchInput({
	value,
	onChange,
	placeholder = "Search...",
	debounceMs = 300,
	className,
}: SearchInputProps) {
	const [localValue, setLocalValue] = useState(value);
	const isInitialMount = useRef(true);

	// Sync external value changes
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Debounced onChange
	useEffect(() => {
		// Skip on initial mount to avoid calling onChange with the initial value
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const timer = setTimeout(() => {
			if (localValue !== value) {
				onChange(localValue);
			}
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [localValue, debounceMs, onChange, value]);

	const handleClear = () => {
		setLocalValue("");
		onChange("");
	};

	return (
		<div
			data-slot="search-input"
			className={cn("relative", className)}
		>
			{/* Search icon */}
			<Search
				className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>

			<Input
				type="search"
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				placeholder={placeholder}
				className="pl-9 pr-9"
				aria-label={placeholder}
			/>

			{/* Clear button */}
			{localValue && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Clear search"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
}

export { SearchInput };
export type { SearchInputProps };
