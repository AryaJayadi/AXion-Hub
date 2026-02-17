/**
 * Exponential backoff reconnection strategy with jitter.
 *
 * Delay formula: min(baseDelay * 2^attempt + jitter, maxDelay)
 * Jitter: random 0-1000ms to prevent thundering herd
 *
 * Default configuration:
 * - Base delay: 1000ms
 * - Max delay: 30000ms
 * - Max attempts: 5
 */

export interface ReconnectConfig {
	/** Base delay in milliseconds (default: 1000) */
	baseDelay?: number | undefined;
	/** Maximum delay in milliseconds (default: 30000) */
	maxDelay?: number | undefined;
	/** Maximum number of reconnection attempts (default: 5) */
	maxAttempts?: number | undefined;
}

export class ReconnectStrategy {
	private _attempt = 0;
	private readonly baseDelay: number;
	private readonly maxDelay: number;
	private readonly _maxAttempts: number;

	constructor(config?: ReconnectConfig) {
		this.baseDelay = config?.baseDelay ?? 1000;
		this.maxDelay = config?.maxDelay ?? 30000;
		this._maxAttempts = config?.maxAttempts ?? 5;
	}

	/** Current attempt number (0-based before first retry) */
	get attempt(): number {
		return this._attempt;
	}

	/** Maximum allowed attempts */
	get maxAttempts(): number {
		return this._maxAttempts;
	}

	/**
	 * Calculate the next delay and increment the attempt counter.
	 * Uses exponential backoff with random jitter.
	 *
	 * @returns Delay in milliseconds before the next reconnection attempt
	 */
	nextDelay(): number {
		const exponentialDelay = this.baseDelay * 2 ** this._attempt;
		const jitter = Math.random() * 1000;
		const delay = Math.min(exponentialDelay + jitter, this.maxDelay);
		this._attempt++;
		return delay;
	}

	/**
	 * Check whether another retry attempt is allowed.
	 *
	 * @returns true if the current attempt count is below the maximum
	 */
	shouldRetry(): boolean {
		return this._attempt < this._maxAttempts;
	}

	/**
	 * Reset the attempt counter. Called after a successful connection
	 * or when the user triggers a manual retry.
	 */
	reset(): void {
		this._attempt = 0;
	}
}
