import { createAuditLog } from "@/features/audit";

export async function POST(request: Request) {
	const body = await request.json();

	// Simulate a resource creation
	const resourceId = `test-${Date.now()}`;

	// Log the audit event
	await createAuditLog(
		{
			actor: "system",
			actorType: "system",
			action: "create",
			resourceType: "test-resource",
			resourceId,
			after: body,
		},
		request,
	);

	return Response.json(
		{ id: resourceId, message: "Test resource created, audit log queued" },
		{ status: 201 },
	);
}
