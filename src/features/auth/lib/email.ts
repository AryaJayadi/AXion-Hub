import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "localhost",
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_SECURE === "true",
	auth: process.env.SMTP_USER
		? {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			}
		: undefined,
});

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
	const from =
		process.env.EMAIL_FROM || "AXion Hub <noreply@axionhub.local>";

	// In development without SMTP configured, log the email to console
	if (
		process.env.NODE_ENV === "development" &&
		(!process.env.SMTP_HOST || process.env.SMTP_HOST === "localhost")
	) {
		console.log("[Email] Development mode — email logged to console:");
		console.log(`  To: ${options.to}`);
		console.log(`  From: ${from}`);
		console.log(`  Subject: ${options.subject}`);
		console.log(`  HTML: ${options.html}`);
		if (options.text) {
			console.log(`  Text: ${options.text}`);
		}
	}

	try {
		await transporter.sendMail({
			from,
			...options,
		});
	} catch (error) {
		// Fire-and-forget: log errors but do not throw.
		// Email failure should never block authentication flows.
		console.error("[Email] Failed to send email:", error);
	}
}
