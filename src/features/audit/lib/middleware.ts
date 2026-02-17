import { nanoid } from "nanoid";
import { auditQueue } from "@/shared/lib/queue";

// --- Types ---

type ActorType = "user" | "system" | "webhook";
type AuditAction = "create" | "update" | "delete";

interface AuditContext {
	actor: string;
	actorType: ActorType;
	action: AuditAction;
	resourceType: string;
	resourceId: string;
	before?: unknown;
	after?: unknown;
}

type RouteHandler = (request: Request) => Promise<Response>;

interface AuditOptions {
	action: AuditAction;
	resourceType: string;
	getResourceId: (
		request: Request,
		response: Response,
	) => string | Promise<string>;
	getBefore?: (request: Request) => unknown | Promise<unknown>;
	getAfter?: (
		request: Request,
		response: Response,
	) => unknown | Promise<unknown>;
}

// --- Secret Scrubbing ---

const SENSITIVE_KEYS =
	/^(password|api_key|apikey|token|secret|authorization|credential|private_key|privatekey)$/i;

function scrubSecrets(value: unknown): unknown {
	if (value === null || value === undefined) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((item) => scrubSecrets(item));
	}

	if (typeof value === "object") {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			if (SENSITIVE_KEYS.test(key)) {
				result[key] = "[REDACTED]";
			} else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
				// One level deep for nested objects
				const nested: Record<string, unknown> = {};
				for (const [nk, nv] of Object.entries(val as Record<string, unknown>)) {
					nested[nk] = SENSITIVE_KEYS.test(nk) ? "[REDACTED]" : nv;
				}
				result[key] = nested;
			} else {
				result[key] = val;
			}
		}
		return result;
	}

	return value;
}

// --- Public API ---

/**
 * Directly create an audit log entry by enqueuing a job to the audit queue.
 * Use this when you need fine-grained control over what gets logged.
 */
export async function createAuditLog(
	ctx: AuditContext,
	request?: Request,
): Promise<void> {
	const metadata = request
		? {
				ip:
					request.headers.get("x-forwarded-for") ??
					request.headers.get("x-real-ip") ??
					"unknown",
				userAgent: request.headers.get("user-agent") ?? "unknown",
				correlationId: nanoid(),
				url: request.url,
				method: request.method,
			}
		: { correlationId: nanoid() };

	// Scrub secrets from before/after
	const sanitizedBefore = scrubSecrets(ctx.before);
	const sanitizedAfter = scrubSecrets(ctx.after);

	// Enqueue to BullMQ for async processing
	await auditQueue.add("audit-log", {
		...ctx,
		before: sanitizedBefore,
		after: sanitizedAfter,
		metadata,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Higher-order function that wraps a Next.js API route handler to add
 * automatic audit logging on successful mutations.
 */
export function withAudit(
	handler: RouteHandler,
	options: AuditOptions,
): RouteHandler {
	return async (request: Request) => {
		const before = options.getBefore
			? await options.getBefore(request)
			: undefined;

		const response = await handler(request);

		// Only audit successful mutations
		if (response.ok) {
			const after = options.getAfter
				? await options.getAfter(request, response)
				: undefined;
			const resourceId = await options.getResourceId(request, response);

			await createAuditLog(
				{
					actor: "system", // Will be replaced with auth user in Phase 2
					actorType: "system",
					action: options.action,
					resourceType: options.resourceType,
					resourceId,
					before,
					after,
				},
				request,
			);
		}

		return response;
	};
}
