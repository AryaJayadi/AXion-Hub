"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

interface ErrorBoundaryProps {
	/** Custom fallback UI to render on error */
	fallback?: ReactNode;
	/** Error reporting callback */
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	/** Children to render */
	children: ReactNode;
	/** Additional class names for the fallback container */
	className?: string;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.props.onError?.(error, errorInfo);
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	override render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<DefaultErrorFallback
					error={this.state.error}
					onReset={this.handleReset}
					className={this.props.className ?? ""}
				/>
			);
		}

		return this.props.children;
	}
}

/** Default error fallback UI */
function DefaultErrorFallback({
	error,
	onReset,
	className,
}: {
	error: Error | null;
	onReset: () => void;
	className?: string;
}) {
	const isDev = process.env.NODE_ENV === "development";

	return (
		<div
			data-slot="error-fallback"
			className={cn(
				"flex flex-col items-center justify-center px-6 py-16 text-center",
				className,
			)}
		>
			<div className="mb-4 rounded-full bg-destructive/10 p-3">
				<AlertTriangle className="size-8 text-destructive" />
			</div>

			<h3 className="text-lg font-semibold text-foreground">
				Something went wrong
			</h3>

			<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
				An unexpected error occurred. Please try again or contact support if the
				problem persists.
			</p>

			{isDev && error && (
				<pre className="mt-4 max-w-lg overflow-auto rounded-md border border-border bg-muted/50 p-3 text-left text-xs text-destructive">
					{error.message}
					{error.stack && `\n\n${error.stack}`}
				</pre>
			)}

			<Button
				onClick={onReset}
				variant="outline"
				size="sm"
				className="mt-6"
			>
				<RefreshCw className="mr-1.5 size-3.5" />
				Try again
			</Button>
		</div>
	);
}

/** Higher-order component wrapping a component with ErrorBoundary */
function withErrorBoundary<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
	function WithErrorBoundaryWrapper(props: P) {
		return (
			<ErrorBoundary {...errorBoundaryProps}>
				<WrappedComponent {...props} />
			</ErrorBoundary>
		);
	}

	WithErrorBoundaryWrapper.displayName = `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;

	return WithErrorBoundaryWrapper;
}

export { ErrorBoundary, DefaultErrorFallback, withErrorBoundary };
export type { ErrorBoundaryProps };
