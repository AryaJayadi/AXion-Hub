"use client";

import { useQueryState } from "nuqs";

import { useAuditLog } from "@/features/audit/api/use-audit-log";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { PageHeader } from "@/shared/ui/page-header";
import { FilterBar, type FilterConfig } from "@/shared/ui/filter-bar";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "actor",
		label: "Actor",
		type: "text",
	},
	{
		key: "action",
		label: "Action",
		type: "select",
		options: [
			{ label: "Create", value: "create" },
			{ label: "Update", value: "update" },
			{ label: "Delete", value: "delete" },
			{ label: "Approve", value: "approve" },
			{ label: "Reject", value: "reject" },
			{ label: "Login", value: "login" },
			{ label: "Logout", value: "logout" },
		],
	},
	{
		key: "resource",
		label: "Resource Type",
		type: "select",
		options: [
			{ label: "Task", value: "task" },
			{ label: "Agent", value: "agent" },
			{ label: "Session", value: "session" },
			{ label: "File", value: "file" },
			{ label: "Policy", value: "policy" },
			{ label: "User", value: "user" },
		],
	},
	{
		key: "period",
		label: "Period",
		type: "select",
		options: [
			{ label: "Last 7 days", value: "7d" },
			{ label: "Last 30 days", value: "30d" },
			{ label: "All time", value: "all" },
		],
	},
];

export function AuditLogView() {
	const [actor, setActor] = useQueryState("actor", { defaultValue: "" });
	const [action, setAction] = useQueryState("action", { defaultValue: "" });
	const [resource, setResource] = useQueryState("resource", {
		defaultValue: "",
	});
	const [period, setPeriod] = useQueryState("period", {
		defaultValue: "7d",
	});

	const filters = {
		...(actor ? { actor } : {}),
		...(action ? { action } : {}),
		...(resource ? { resourceType: resource } : {}),
		period: (period || "7d") as "7d" | "30d" | "all",
	};

	const { data: entries, isLoading } = useAuditLog(filters);

	const filterValues: Record<string, unknown> = {
		...(actor ? { actor } : {}),
		...(action ? { action } : {}),
		...(resource ? { resource } : {}),
		...(period && period !== "7d" ? { period } : {}),
	};

	function handleFilterChange(key: string, value: unknown) {
		const strValue = (value as string) ?? "";
		switch (key) {
			case "actor":
				void setActor(strValue || null);
				break;
			case "action":
				void setAction(strValue || null);
				break;
			case "resource":
				void setResource(strValue || null);
				break;
			case "period":
				void setPeriod(strValue || null);
				break;
		}
	}

	function handleFilterClear() {
		void setActor(null);
		void setAction(null);
		void setResource(null);
		void setPeriod(null);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Audit Log"
				description="Immutable record of all system actions"
			/>

			<FilterBar
				filters={FILTER_CONFIG}
				values={filterValues}
				onChange={handleFilterChange}
				onClear={handleFilterClear}
			/>

			{/* Entry count */}
			{!isLoading && entries && (
				<p className="text-sm text-muted-foreground">
					Showing {entries.length} entries
				</p>
			)}

			{/* Table */}
			{isLoading ? (
				<SkeletonTable rows={10} columns={5} />
			) : entries ? (
				<AuditLogTable data={entries} />
			) : null}
		</div>
	);
}
