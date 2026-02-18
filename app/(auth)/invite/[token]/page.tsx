import { InviteAcceptance } from "@/features/auth/components/invite-acceptance";

export const metadata = {
	title: "Accept Invitation - AXion Hub",
	description: "Accept your organization invitation",
};

export default async function InvitePage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	return (
		<div className="flex min-h-svh items-center justify-center">
			<InviteAcceptance token={token} />
		</div>
	);
}
