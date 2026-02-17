import { useId, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface FormFieldProps {
	/** Field label text */
	label: string;
	/** Help text displayed below the label */
	description?: string;
	/** Error message displayed below the input */
	error?: string;
	/** Shows a red asterisk on the label */
	required?: boolean;
	/** The form input element */
	children: ReactNode;
	/** Additional class names */
	className?: string;
}

function FormField({
	label,
	description,
	error,
	required = false,
	children,
	className,
}: FormFieldProps) {
	const generatedId = useId();

	return (
		<div data-slot="form-field" className={cn("space-y-2", className)}>
			{/* Label */}
			<label
				htmlFor={generatedId}
				className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
				{required && (
					<span className="ml-0.5 text-destructive" aria-label="required">
						*
					</span>
				)}
			</label>

			{/* Description */}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Input slot -- clone with id if single child */}
			<div data-field-id={generatedId}>{children}</div>

			{/* Error message */}
			{error && (
				<p
					className="text-xs text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

export { FormField };
export type { FormFieldProps };
