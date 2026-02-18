import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = [
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
];

const PUBLIC_PATHS = [
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/verify-email",
	"/invite",
	"/api/auth",
];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const sessionCookie = getSessionCookie(request);

	// Auth pages: redirect to dashboard if already logged in
	const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
	if (isAuthPage && sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Public paths: allow through without session
	const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
	if (!isPublic && !sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
