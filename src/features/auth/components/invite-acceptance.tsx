"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { authClient } from "@/features/auth/lib/auth-client";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

type InviteStatus = "checking" | "redirecting" | "accepting" | "success" | "error";

interface InviteAcceptanceProps {
	token: string;
}

export function InviteAcceptance({ token }: InviteAcceptanceProps) {
	const router = useRouter();
	const [status, setStatus] = useState<InviteStatus>("checking");
	const [orgName, setOrgName] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		async function handleInvitation() {
			try {
				const { data: session } = await authClient.getSession();

				if (!session) {
					setStatus("redirecting");
					router.push(`/login?callbackUrl=/invite/${token}`);
					return;
				}

				setStatus("accepting");

				const result = await authClient.organization.acceptInvitation({
					invitationId: token,
				});

				if (result.error) {
					setStatus("error");
					const errorMsg = result.error.message || "Failed to accept invitation";
					if (errorMsg.toLowerCase().includes("expired")) {
						setErrorMessage("This invitation has expired. Please ask the organization admin to send a new invite.");
					} else if (errorMsg.toLowerCase().includes("already")) {
						setErrorMessage("You are already a member of this organization.");
					} else if (errorMsg.toLowerCase().includes("not found") || errorMsg.toLowerCase().includes("invalid")) {
						setErrorMessage("This invitation link is invalid. Please check the link and try again.");
					} else {
						setErrorMessage(errorMsg);
					}
					return;
				}

				if (result.data?.member?.organizationId) {
					await authClient.organization.setActive({
						organizationId: result.data.member.organizationId,
					});
					setOrgName(result.data.member.organizationId);
				}

				setStatus("success");

				setTimeout(() => {
					router.push("/");
				}, 1000);
			} catch {
				setStatus("error");
				setErrorMessage("An unexpected error occurred. Please try again later.");
			}
		}

		handleInvitation();
	}, [token, router]);

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle>
					{status === "checking" && "Checking invitation..."}
					{status === "redirecting" && "Redirecting to sign in..."}
					{status === "accepting" && "Joining organization..."}
					{status === "success" && "You've joined the organization!"}
					{status === "error" && "Unable to accept invitation"}
				</CardTitle>
				<CardDescription>
					{status === "checking" && "Verifying your invitation link"}
					{status === "redirecting" && "You need to sign in first"}
					{status === "accepting" && "Setting up your membership"}
					{status === "success" && "Redirecting to dashboard..."}
					{status === "error" && "Something went wrong"}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-4">
				{(status === "checking" || status === "redirecting" || status === "accepting") && (
					<Loader2 className="size-8 animate-spin text-muted-foreground" />
				)}

				{status === "success" && (
					<>
						<CheckCircle2 className="size-8 text-green-500" />
						{orgName && (
							<p className="text-sm text-muted-foreground">
								Organization ID: {orgName}
							</p>
						)}
					</>
				)}

				{status === "error" && (
					<>
						<AlertCircle className="size-8 text-destructive" />
						<p className="text-sm text-center text-muted-foreground">
							{errorMessage}
						</p>
						<Button variant="outline" onClick={() => router.push("/")}>
							Go to dashboard
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}
