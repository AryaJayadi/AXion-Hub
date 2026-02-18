import { type ConnectionOptions, Worker, type Job } from "bullmq";
import { db } from "../src/shared/lib/db";
import { createRedisConnection } from "../src/shared/lib/redis";
import { alertNotifications } from "../src/features/dashboard/model/alert-schema";

// BullMQ bundles its own ioredis -- cast for exactOptionalPropertyTypes compat
const connection = createRedisConnection() as unknown as ConnectionOptions;

interface EvaluateRuleJob {
	type: "evaluate-rule";
	ruleId: string;
	ruleName: string;
	metric: string;
	operator: string;
	threshold: number;
	severity: string;
	webhookUrl?: string | null;
}

interface DeliverWebhookJob {
	type: "deliver-webhook";
	webhookUrl: string;
	payload: Record<string, unknown>;
}

type AlertJobData = EvaluateRuleJob | DeliverWebhookJob;

async function processJob(job: Job<AlertJobData>) {
	const { data } = job;

	if (data.type === "evaluate-rule") {
		return handleEvaluateRule(data);
	}

	if (data.type === "deliver-webhook") {
		return handleDeliverWebhook(data);
	}

	throw new Error(`Unknown alert job type: ${(data as { type: string }).type}`);
}

/**
 * Evaluate an alert rule condition against current state.
 *
 * For now this is a skeleton that logs the evaluation. Real evaluation
 * requires live gateway/agent data which arrives in Phase 7+.
 * If the condition were met, we insert an alert_notification record.
 */
async function handleEvaluateRule(data: EvaluateRuleJob) {
	console.log(
		`[alert-worker] Evaluating rule "${data.ruleName}": ${data.metric} ${data.operator} ${data.threshold}`,
	);

	// Skeleton: simulate condition check (always false for now)
	const conditionMet = false;

	if (conditionMet) {
		const message = `Alert: ${data.ruleName} -- ${data.metric} ${data.operator} ${data.threshold}`;

		await db.insert(alertNotifications).values({
			ruleId: data.ruleId,
			severity: data.severity,
			message,
			details: {
				metric: data.metric,
				operator: data.operator,
				threshold: data.threshold,
				evaluatedAt: new Date().toISOString(),
			},
		});

		console.log(`[alert-worker] Alert notification created for rule "${data.ruleName}"`);
	}
}

/**
 * Deliver an alert payload to an external webhook URL.
 *
 * Only retries on 5xx/network errors. 4xx responses are logged but
 * not retried to avoid queue retry exhaustion on permanent failures.
 */
async function handleDeliverWebhook(data: DeliverWebhookJob) {
	console.log(`[alert-worker] Delivering webhook to ${data.webhookUrl}`);

	const response = await fetch(data.webhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data.payload),
	});

	if (!response.ok) {
		const status = response.status;
		if (status >= 500) {
			// Server error -- throw to trigger BullMQ retry
			throw new Error(
				`Webhook delivery failed with status ${status}: ${data.webhookUrl}`,
			);
		}
		// Client error (4xx) -- log but don't retry
		console.error(
			`[alert-worker] Webhook delivery got ${status} from ${data.webhookUrl} -- not retrying`,
		);
	}
}

const alertWorker = new Worker("alerts", processJob, {
	connection,
	concurrency: 5,
});

// Logging
alertWorker.on("completed", (job) => {
	console.log(`[alert-worker] Job ${job.id} completed`);
});

alertWorker.on("failed", (job, err) => {
	console.error(`[alert-worker] Job ${job?.id} failed:`, err.message);
});

console.log("[alert-worker] Started, waiting for jobs...");
