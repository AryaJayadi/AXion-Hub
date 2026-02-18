/**
 * Format a token count with K/M suffixes for display.
 *
 * @example
 * formatTokenCount(1500)     // "1.5K"
 * formatTokenCount(1200000)  // "1.2M"
 * formatTokenCount(500)      // "500"
 */
export function formatTokenCount(tokens: number): string {
	if (tokens >= 1_000_000) {
		const millions = tokens / 1_000_000;
		return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
	}
	if (tokens >= 1_000) {
		const thousands = tokens / 1_000;
		return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
	}
	return String(tokens);
}

/**
 * Format a dollar amount for display.
 *
 * @example
 * formatDollarCost(0.0523)  // "$0.05"
 * formatDollarCost(12.456)  // "$12.46"
 */
export function formatDollarCost(dollars: number): string {
	return `$${dollars.toFixed(2)}`;
}

/**
 * Approximate per-token pricing by model (per 1M tokens).
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
	"claude-sonnet-4": { input: 3, output: 15 },
	"claude-opus-4": { input: 15, output: 75 },
	"claude-haiku-3.5": { input: 0.8, output: 4 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

/**
 * Estimate the dollar cost based on token usage and model.
 *
 * Uses approximate per-token rates. Defaults to claude-sonnet-4 pricing
 * if the model is not recognized.
 *
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - Model identifier (e.g., "claude-sonnet-4")
 * @returns Estimated dollar cost
 */
export function estimateCost(
	inputTokens: number,
	outputTokens: number,
	model: string,
): number {
	const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING;
	const inputCost = (inputTokens / 1_000_000) * pricing.input;
	const outputCost = (outputTokens / 1_000_000) * pricing.output;
	return inputCost + outputCost;
}
