"use client";

import { useCallback, useState } from "react";
import { CheckCircle, Loader2, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

import { useApprovalActions } from "../api/use-approval-actions";

type ActionType = "approve" | "reject" | "revision";

interface ApprovalActionPanelProps {
	taskId: string;
	onComplete: () => void;
}

export function ApprovalActionPanel({
	taskId,
	onComplete,
}: ApprovalActionPanelProps) {
	const approvalActions = useApprovalActions();
	const [selectedAction, setSelectedAction] = useState<ActionType | null>(
		null,
	);
	const [comment, setComment] = useState("");
	const [showApproveComment, setShowApproveComment] = useState(false);

	const requiresComment =
		selectedAction === "reject" || selectedAction === "revision";
	const canSubmit =
		selectedAction === "approve" ||
		(requiresComment && comment.trim().length > 0);

	const handleSelectAction = useCallback(
		(action: ActionType) => {
			if (selectedAction === action) {
				setSelectedAction(null);
				setComment("");
				setShowApproveComment(false);
			} else {
				setSelectedAction(action);
				setComment("");
				setShowApproveComment(false);
			}
		},
		[selectedAction],
	);

	const handleSubmit = useCallback(() => {
		if (!selectedAction || !canSubmit) return;

		approvalActions.mutate(
			{
				taskId,
				action: {
					type: selectedAction,
					comment: comment.trim(),
					reviewedAt: new Date(),
				},
			},
			{
				onSuccess: () => {
					onComplete();
				},
			},
		);
	}, [selectedAction, canSubmit, comment, taskId, approvalActions, onComplete]);

	const confirmLabel =
		selectedAction === "approve"
			? "Confirm Approval"
			: selectedAction === "reject"
				? "Confirm Rejection"
				: selectedAction === "revision"
					? "Submit Revision Request"
					: "";

	return (
		<div className="rounded-lg border border-border bg-card p-4 space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
				Decision
			</p>

			<div className="flex flex-wrap gap-2">
				{/* Approve */}
				<Button
					variant={
						selectedAction === "approve" ? "default" : "outline"
					}
					className={cn(
						"gap-2",
						selectedAction === "approve" &&
							"bg-green-600 text-white hover:bg-green-700",
					)}
					onClick={() => handleSelectAction("approve")}
					disabled={approvalActions.isPending}
				>
					<CheckCircle className="size-4" />
					Approve
				</Button>

				{/* Reject */}
				<Button
					variant={
						selectedAction === "reject" ? "default" : "outline"
					}
					className={cn(
						"gap-2",
						selectedAction === "reject" &&
							"bg-red-600 text-white hover:bg-red-700",
					)}
					onClick={() => handleSelectAction("reject")}
					disabled={approvalActions.isPending}
				>
					<XCircle className="size-4" />
					Reject
				</Button>

				{/* Request Revision */}
				<Button
					variant={
						selectedAction === "revision" ? "default" : "outline"
					}
					className={cn(
						"gap-2",
						selectedAction === "revision" &&
							"bg-orange-600 text-white hover:bg-orange-700",
					)}
					onClick={() => handleSelectAction("revision")}
					disabled={approvalActions.isPending}
				>
					<RotateCcw className="size-4" />
					Request Revision
				</Button>
			</div>

			{/* Comment for reject/revision (required) */}
			{requiresComment && (
				<div className="space-y-1.5">
					<p className="text-xs text-muted-foreground">
						{selectedAction === "reject"
							? "Reason for rejection (required)"
							: "Revision notes (required)"}
					</p>
					<Textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder={
							selectedAction === "reject"
								? "Reason for rejection..."
								: "Explain what needs to change..."
						}
						rows={4}
						className="text-sm"
					/>
				</div>
			)}

			{/* Optional comment for approve */}
			{selectedAction === "approve" && !showApproveComment && (
				<button
					type="button"
					className="text-xs text-primary hover:underline"
					onClick={() => setShowApproveComment(true)}
				>
					Add comment (optional)
				</button>
			)}
			{selectedAction === "approve" && showApproveComment && (
				<Textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Optional comment..."
					rows={3}
					className="text-sm"
				/>
			)}

			{/* Submit */}
			{selectedAction && (
				<Button
					onClick={handleSubmit}
					disabled={!canSubmit || approvalActions.isPending}
					className={cn(
						"w-full",
						selectedAction === "approve" &&
							"bg-green-600 hover:bg-green-700",
						selectedAction === "reject" &&
							"bg-red-600 hover:bg-red-700",
						selectedAction === "revision" &&
							"bg-orange-600 hover:bg-orange-700",
					)}
				>
					{approvalActions.isPending ? (
						<>
							<Loader2 className="size-4 mr-2 animate-spin" />
							Submitting...
						</>
					) : (
						confirmLabel
					)}
				</Button>
			)}
		</div>
	);
}
