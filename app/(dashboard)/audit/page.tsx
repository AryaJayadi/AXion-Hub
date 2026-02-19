import { Suspense } from "react";
import { AuditLogView } from "@/views/audit/audit-log-view";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Audit Log | AXion Hub",
};

export default function AuditPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={10} columns={5} />}>
			<AuditLogView />
		</Suspense>
	);
}
