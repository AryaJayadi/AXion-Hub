"use client";

import { useState } from "react";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Package,
	RotateCcw,
	XCircle,
} from "lucide-react";

import type { Deliverable } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

import { DeliverablePreviewCard } from "./deliverable-preview-card";
import { TaskSignOffModal } from "./task-sign-off-modal";

interface TaskDeliverablesProps {
	taskId: string;
	deliverables: Deliverable[];
	signOffRequired: boolean;
	signOffStatus: string | undefined;
}

/** Sign-off status banner configuration */
const SIGN_OFF_BANNERS: Record<
	string,
	{
		icon: typeof CheckCircle2;
		label: string;
		className: string;
		showReview: boolean;
	}
> = {
	pending: {
		icon: Clock,
		label: "Awaiting human sign-off",
		className:
			"border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
		showReview: true,
	},
	approved: {
		icon: CheckCircle2,
		label: "Approved",
		className:
			"border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
		showReview: false,
	},
	rejected: {
		icon: XCircle,
		label: "Rejected",
		className:
			"border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
		showReview: false,
	},
	revision_requested: {
		icon: RotateCcw,
		label: "Revision requested",
		className:
			"border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
		showReview: false,
	},
};

export function TaskDeliverables({
	taskId,
	deliverables,
	signOffRequired,
	signOffStatus,
}: TaskDeliverablesProps) {
	const [reviewModalOpen, setReviewModalOpen] = useState(false);

	if (deliverables.length === 0) {
		return (
			<div className="space-y-2 pt-4 border-t">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Deliverables
				</p>
				<div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
					<Package className="size-8 mb-2 opacity-50" />
					<p className="text-xs">No deliverables submitted yet</p>
				</div>
			</div>
		);
	}

	const bannerConfig =
		signOffRequired && signOffStatus
			? SIGN_OFF_BANNERS[signOffStatus]
			: null;

	return (
		<div className="space-y-3 pt-4 border-t">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
				Deliverables
			</p>

			{/* Sign-off status banner */}
			{bannerConfig && (
				<div
					className={cn(
						"flex items-center justify-between rounded-md border p-3",
						bannerConfig.className,
					)}
				>
					<div className="flex items-center gap-2">
						<bannerConfig.icon className="size-4" />
						<span className="text-sm font-medium">
							{bannerConfig.label}
						</span>
					</div>
					{bannerConfig.showReview && (
						<Button
							size="sm"
							variant="outline"
							className="h-7 text-xs border-current"
							onClick={() => setReviewModalOpen(true)}
						>
							<AlertCircle className="size-3 mr-1" />
							Review
						</Button>
					)}
				</div>
			)}

			{/* Deliverable grid */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				{deliverables.map((deliverable) => (
					<DeliverablePreviewCard
						key={deliverable.id}
						deliverable={deliverable}
					/>
				))}
			</div>

			{/* Sign-off review modal */}
			<TaskSignOffModal
				taskId={taskId}
				deliverables={deliverables}
				open={reviewModalOpen}
				onClose={() => setReviewModalOpen(false)}
			/>
		</div>
	);
}
