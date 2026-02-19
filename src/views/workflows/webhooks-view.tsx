"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

import { useWebhooks } from "@/features/workflows/api/use-webhooks";
import { WebhookTable } from "@/features/workflows/components/webhook-table";
import { WebhookCreateDialog } from "@/features/workflows/components/webhook-create-dialog";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WebhooksView() {
	const { webhooks, isLoading } = useWebhooks();
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleOpenChange = useCallback((open: boolean) => {
		setDialogOpen(open);
	}, []);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Webhook Endpoints"
				description="Create inbound webhook URLs that trigger workflow executions"
				breadcrumbs={[
					{ label: "Workflows", href: "/workflows" },
					{ label: "Webhooks" },
				]}
				actions={
					<Button onClick={() => setDialogOpen(true)}>
						<Plus className="mr-2 size-4" />
						Create Webhook
					</Button>
				}
			/>

			<WebhookTable webhooks={webhooks} {...(isLoading ? { isLoading } : {})} />

			<WebhookCreateDialog
				open={dialogOpen}
				onOpenChange={handleOpenChange}
			/>
		</div>
	);
}
