// ─── Middleware ──────────────────────────────────────────
// Runs BEFORE every request to protected routes.
//
// PURPOSE:
// 1. Refresh the user's session (Supabase tokens expire)
// 2. Redirect unauthenticated users to /login
// 3. Redirect authenticated users away from /login to /notes
//
// WHY Middleware?
// - Runs on the EDGE (before the page even starts rendering)
// - Prevents flash of content for unauthorized users
// - Session refresh keeps the user logged in transparently
//
// SECURITY:
// This is the FIRST line of defense. Even if someone manually navigates
// to /notes without logging in, they'll be redirected to /login.
// The SECOND line of defense is RLS on Supabase (Phase 5 continued).

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Forward cookies to the request (for Server Components)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Create a new response with updated cookies
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    // Set cookies on the response (for the browser)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session — this extends the token if it's about to expire
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = request.nextUrl.pathname === "/login";
    const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");

    // Don't redirect auth callback requests
    if (isAuthCallback) {
        return response;
    }

    // Not logged in + trying to access protected route → redirect to login
    if (!user && !isLoginPage) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Logged in + on login page → redirect to dashboard
    if (user && isLoginPage) {
        const dashboardUrl = new URL("/notes", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return response;
}

// Run middleware on these routes ONLY
// (skip static files, images, favicon, etc.)
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
