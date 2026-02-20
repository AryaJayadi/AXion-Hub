import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/features/auth/lib/auth";
import { db } from "@/shared/lib/db";
import {
	alertNotifications,
	alertRules,
} from "@/features/dashboard/model/alert-schema";

export async function GET(request: NextRequest) {
	// Session validation (defense-in-depth)
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Query parameter parsing: default 10, capped at 50
	const limitParam = request.nextUrl.searchParams.get("limit");
	const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50);

	// Database query with LEFT JOIN on alertRules for ruleName
	const rows = await db
		.select({
			id: alertNotifications.id,
			ruleId: alertNotifications.ruleId,
			ruleName: alertRules.name,
			severity: alertNotifications.severity,
			message: alertNotifications.message,
			createdAt: alertNotifications.createdAt,
			read: alertNotifications.read,
		})
		.from(alertNotifications)
		.leftJoin(alertRules, eq(alertNotifications.ruleId, alertRules.id))
		.orderBy(desc(alertNotifications.createdAt))
		.limit(limit);

	return Response.json(rows);
}
