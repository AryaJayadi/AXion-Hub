"use client";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
	type PolicyRule,
	CONDITION_FIELD_LABELS,
	OPERATOR_LABELS,
	ACTION_LABELS,
} from "@/entities/governance";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/shared/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Switch } from "@/shared/ui/switch";

/** Color mapping for policy actions */
const ACTION_BADGE_COLORS: Record<string, string> = {
	auto_approve:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	block: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	require_approval:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	notify: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

interface PolicyRuleRowProps {
	policy: PolicyRule;
	onEdit: (policy: PolicyRule) => void;
	onDelete: (id: string) => void;
	onToggle: (id: string, enabled: boolean) => void;
}

export function PolicyRuleRow({
	policy,
	onEdit,
	onDelete,
	onToggle,
}: PolicyRuleRowProps) {
	return (
		<Card
			className={cn(
				"transition-opacity",
				!policy.enabled && "opacity-60",
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-3">
					<h3 className="font-medium text-sm">{policy.name}</h3>
					{!policy.enabled && (
						<Badge variant="secondary" className="text-xs">
							Disabled
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Switch
						checked={policy.enabled}
						onCheckedChange={(checked) =>
							onToggle(policy.id, checked)
						}
						aria-label={`Toggle ${policy.name}`}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8">
								<MoreHorizontal className="size-4" />
								<span className="sr-only">Actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onEdit(policy)}>
								<Pencil className="mr-2 size-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete(policy.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 size-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Condition display */}
				<div className="flex flex-wrap items-center gap-1.5">
					{policy.conditions.map((condition, index) => (
						<span key={`${condition.field}-${index.toString()}`} className="contents">
							{index > 0 && (
								<span className="text-xs font-medium text-muted-foreground px-1">
									AND
								</span>
							)}
							<Badge variant="outline" className="text-xs px-2 py-0.5">
								IF{" "}
								<span className="font-medium">
									{CONDITION_FIELD_LABELS[condition.field]}
								</span>{" "}
								{OPERATOR_LABELS[condition.operator]}{" "}
								<span className="font-mono">{condition.value}</span>
							</Badge>
						</span>
					))}
					<Badge
						variant="secondary"
						className={cn(
							"text-xs px-2 py-0.5",
							ACTION_BADGE_COLORS[policy.action],
						)}
					>
						THEN {ACTION_LABELS[policy.action]}
					</Badge>
				</div>

				{/* Description and dates */}
				<div className="flex flex-col gap-1">
					{policy.description && (
						<p className="text-sm text-muted-foreground">
							{policy.description}
						</p>
					)}
					<p className="text-xs text-muted-foreground">
						Created {format(policy.createdAt, "MMM d, yyyy")}
						{policy.updatedAt.getTime() !==
							policy.createdAt.getTime() &&
							` -- Updated ${format(policy.updatedAt, "MMM d, yyyy")}`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
