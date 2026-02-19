"use client";

import { ShieldCheck } from "lucide-react";

import type { PolicyRule } from "@/entities/governance";
import { EmptyState } from "@/shared/ui/empty-state";
import { PolicyRuleRow } from "./policy-rule-row";

interface PolicyListProps {
	policies: PolicyRule[];
	onEdit: (policy: PolicyRule) => void;
	onDelete: (id: string) => void;
	onToggle: (id: string, enabled: boolean) => void;
	onCreateFirst?: () => void;
}

export function PolicyList({
	policies,
	onEdit,
	onDelete,
	onToggle,
	onCreateFirst,
}: PolicyListProps) {
	if (policies.length === 0) {
		return (
			<EmptyState
				icon={<ShieldCheck className="size-16 text-muted-foreground/40" />}
				title="No governance policies defined"
				description="Create your first policy to define rules that govern agent behavior."
				{...(onCreateFirst
					? {
							action: {
								label: "Create your first policy",
								onClick: onCreateFirst,
							},
						}
					: {})}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{policies.map((policy) => (
				<PolicyRuleRow
					key={policy.id}
					policy={policy}
					onEdit={onEdit}
					onDelete={onDelete}
					onToggle={onToggle}
				/>
			))}
		</div>
	);
}
