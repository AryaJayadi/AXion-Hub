"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { WsPlayground } from "@/features/developer-tools/components/ws-playground";

export function WsPlaygroundView() {
	return (
		<div>
			<PageHeader
				title="WebSocket Playground"
				description="Test Gateway WebSocket commands live"
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href="/api-docs">
							<ArrowLeft className="mr-1.5 size-4" />
							API Reference
						</Link>
					</Button>
				}
			/>
			<WsPlayground />
		</div>
	);
}
