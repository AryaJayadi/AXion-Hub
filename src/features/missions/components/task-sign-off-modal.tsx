"use client";

import { useCallback, useState } from "react";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

import type { Deliverable } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Textarea } from "@/shared/ui/textarea";

import { useUpdateTask } from "../api/use-task-mutations";
import { DeliverablePreviewCard } from "./deliverable-preview-card";

type SignOffAction = "approve" | "reject" | "revision";

interface TaskSignOffModalProps {
	taskId: string;
	deliverables: Deliverable[];
	open: boolean;
	onClose: () => void;
}

export function TaskSignOffModal({
	taskId,
	deliverables,
	open,
	onClose,
}: TaskSignOffModalProps) {
	const updateTask = useUpdateTask();
	const [activeAction, setActiveAction] = useState<SignOffAction | null>(
		null,
	);
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const resetState = useCallback(() => {
		setActiveAction(null);
		setComment("");
		setSubmitting(false);
	}, []);

	const handleClose = useCallback(() => {
		resetState();
		onClose();
	}, [onClose, resetState]);

	const handleApprove = useCallback(() => {
		setSubmitting(true);
		updateTask.mutate(
			{
				taskId,
				updates: { signOffStatus: "approved" },
			},
			{
				onSuccess: () => {
					toast.success("Deliverables approved");
					handleClose();
				},
				onError: () => {
					setSubmitting(false);
				},
			},
		);
	}, [taskId, updateTask, handleClose]);

	const handleReject = useCallback(() => {
		if (!comment.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}
		setSubmitting(true);
		updateTask.mutate(
			{
				taskId,
				updates: { signOffStatus: "rejected" },
			},
			{
				onSuccess: () => {
					toast.success("Deliverables rejected");
					handleClose();
				},
				onError: () => {
					setSubmitting(false);
				},
			},
		);
	}, [taskId, comment, updateTask, handleClose]);

	const handleRequestRevision = useCallback(() => {
		if (!comment.trim()) {
			toast.error("Please provide revision notes");
			return;
		}
		setSubmitting(true);
		updateTask.mutate(
			{
				taskId,
				updates: { signOffStatus: "revision_requested" },
			},
			{
				onSuccess: () => {
					toast.success("Revision requested");
					handleClose();
				},
				onError: () => {
					setSubmitting(false);
				},
			},
		);
	}, [taskId, comment, updateTask, handleClose]);

	const handleSubmit = useCallback(() => {
		switch (activeAction) {
			case "approve":
				handleApprove();
				break;
			case "reject":
				handleReject();
				break;
			case "revision":
				handleRequestRevision();
				break;
		}
	}, [activeAction, handleApprove, handleReject, handleRequestRevision]);

	const requiresComment = activeAction === "reject" || activeAction === "revision";
	const canSubmit =
		activeAction === "approve" || (requiresComment && comment.trim().length > 0);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-3xl max-h-[85vh]">
				<DialogHeader>
					<DialogTitle>Review Deliverables</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_250px]">
					{/* Left: Deliverables list */}
					<ScrollArea className="max-h-[50vh]">
						<div className="space-y-3 pr-2">
							{deliverables.map((deliverable) => (
								<DeliverablePreviewCard
									key={deliverable.id}
									deliverable={deliverable}
								/>
							))}
						</div>
					</ScrollArea>

					{/* Right: Action buttons */}
					<div className="space-y-3">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Decision
						</p>

						{/* Approve */}
						<Button
							variant={
								activeAction === "approve"
									? "default"
									: "outline"
							}
							className={cn(
								"w-full justify-start gap-2",
								activeAction === "approve" &&
									"bg-green-600 text-white hover:bg-green-700",
							)}
							onClick={() =>
								setActiveAction(
									activeAction === "approve"
										? null
										: "approve",
								)
							}
							disabled={submitting}
						>
							<CheckCircle className="size-4" />
							Approve
						</Button>

						{/* Reject */}
						<Button
							variant={
								activeAction === "reject"
									? "default"
									: "outline"
							}
							className={cn(
								"w-full justify-start gap-2",
								activeAction === "reject" &&
									"bg-red-600 text-white hover:bg-red-700",
							)}
							onClick={() =>
								setActiveAction(
									activeAction === "reject"
										? null
										: "reject",
								)
							}
							disabled={submitting}
						>
							<XCircle className="size-4" />
							Reject
						</Button>

						{/* Request Revision */}
						<Button
							variant={
								activeAction === "revision"
									? "default"
									: "outline"
							}
							className={cn(
								"w-full justify-start gap-2",
								activeAction === "revision" &&
									"bg-orange-600 text-white hover:bg-orange-700",
							)}
							onClick={() =>
								setActiveAction(
									activeAction === "revision"
										? null
										: "revision",
								)
							}
							disabled={submitting}
						>
							<RotateCcw className="size-4" />
							Request Revision
						</Button>

						{/* Comment textarea (required for reject/revision) */}
						{requiresComment && (
							<div className="space-y-1.5">
								<p className="text-xs text-muted-foreground">
									{activeAction === "reject"
										? "Rejection reason (required)"
										: "Revision notes (required)"}
								</p>
								<Textarea
									value={comment}
									onChange={(e) =>
										setComment(e.target.value)
									}
									placeholder={
										activeAction === "reject"
											? "Explain why the deliverables are being rejected..."
											: "Describe what revisions are needed..."
									}
									rows={4}
									className="text-sm"
								/>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={submitting}
					>
						Cancel
					</Button>
					{activeAction && (
						<Button
							onClick={handleSubmit}
							disabled={!canSubmit || submitting}
							className={cn(
								activeAction === "approve" &&
									"bg-green-600 hover:bg-green-700",
								activeAction === "reject" &&
									"bg-red-600 hover:bg-red-700",
								activeAction === "revision" &&
									"bg-orange-600 hover:bg-orange-700",
							)}
						>
							{submitting
								? "Submitting..."
								: activeAction === "approve"
									? "Confirm Approval"
									: activeAction === "reject"
										? "Confirm Rejection"
										: "Submit Revision Request"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
