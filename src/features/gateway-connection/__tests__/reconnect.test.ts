import { describe, expect, it } from "vitest";
import { ReconnectStrategy } from "../lib/reconnect";

describe("ReconnectStrategy", () => {
	it("uses default configuration values", () => {
		const strategy = new ReconnectStrategy();
		expect(strategy.maxAttempts).toBe(5);
		expect(strategy.attempt).toBe(0);
		expect(strategy.shouldRetry()).toBe(true);
	});

	it("accepts custom configuration", () => {
		const strategy = new ReconnectStrategy({
			baseDelay: 500,
			maxDelay: 10000,
			maxAttempts: 3,
		});
		expect(strategy.maxAttempts).toBe(3);
	});

	it("increases delay exponentially", () => {
		// Use a fixed seed approach: test that delays generally increase
		const strategy = new ReconnectStrategy({
			baseDelay: 1000,
			maxDelay: 60000,
			maxAttempts: 10,
		});

		const delays: number[] = [];
		for (let i = 0; i < 5; i++) {
			delays.push(strategy.nextDelay());
		}

		// Each delay should be greater than or equal to the base exponential value
		// (without jitter): 1000, 2000, 4000, 8000, 16000
		expect(delays[0]).toBeGreaterThanOrEqual(1000);
		expect(delays[0]).toBeLessThanOrEqual(2000); // 1000 + up to 1000 jitter

		expect(delays[1]).toBeGreaterThanOrEqual(2000);
		expect(delays[1]).toBeLessThanOrEqual(3000); // 2000 + up to 1000 jitter

		expect(delays[2]).toBeGreaterThanOrEqual(4000);
		expect(delays[2]).toBeLessThanOrEqual(5000); // 4000 + up to 1000 jitter

		expect(delays[3]).toBeGreaterThanOrEqual(8000);
		expect(delays[3]).toBeLessThanOrEqual(9000); // 8000 + up to 1000 jitter
	});

	it("caps delay at maxDelay", () => {
		const strategy = new ReconnectStrategy({
			baseDelay: 1000,
			maxDelay: 5000,
			maxAttempts: 10,
		});

		// After several attempts, delay should be capped
		for (let i = 0; i < 8; i++) {
			const delay = strategy.nextDelay();
			expect(delay).toBeLessThanOrEqual(5000);
		}
	});

	it("stops allowing retries after max attempts", () => {
		const strategy = new ReconnectStrategy({ maxAttempts: 3 });

		expect(strategy.shouldRetry()).toBe(true);
		strategy.nextDelay(); // attempt 0 -> 1
		expect(strategy.shouldRetry()).toBe(true);
		strategy.nextDelay(); // attempt 1 -> 2
		expect(strategy.shouldRetry()).toBe(true);
		strategy.nextDelay(); // attempt 2 -> 3
		expect(strategy.shouldRetry()).toBe(false);
	});

	it("increments attempt counter on each nextDelay call", () => {
		const strategy = new ReconnectStrategy({ maxAttempts: 5 });

		expect(strategy.attempt).toBe(0);
		strategy.nextDelay();
		expect(strategy.attempt).toBe(1);
		strategy.nextDelay();
		expect(strategy.attempt).toBe(2);
	});

	it("resets attempt counter", () => {
		const strategy = new ReconnectStrategy({ maxAttempts: 3 });

		strategy.nextDelay();
		strategy.nextDelay();
		expect(strategy.attempt).toBe(2);
		expect(strategy.shouldRetry()).toBe(true);

		strategy.reset();
		expect(strategy.attempt).toBe(0);
		expect(strategy.shouldRetry()).toBe(true);
	});

	it("allows retries again after reset even if previously exhausted", () => {
		const strategy = new ReconnectStrategy({ maxAttempts: 2 });

		strategy.nextDelay();
		strategy.nextDelay();
		expect(strategy.shouldRetry()).toBe(false);

		strategy.reset();
		expect(strategy.shouldRetry()).toBe(true);
	});

	it("adds jitter to prevent thundering herd", () => {
		const strategy1 = new ReconnectStrategy({ baseDelay: 1000, maxAttempts: 5 });
		const strategy2 = new ReconnectStrategy({ baseDelay: 1000, maxAttempts: 5 });

		// Due to random jitter, two strategies should produce different delays
		// (extremely unlikely to be identical)
		const delays1: number[] = [];
		const delays2: number[] = [];

		for (let i = 0; i < 3; i++) {
			delays1.push(strategy1.nextDelay());
			delays2.push(strategy2.nextDelay());
		}

		// At least one pair should differ (probabilistic test but practically certain)
		const allSame = delays1.every((d, i) => d === delays2[i]);
		expect(allSame).toBe(false);
	});
});
