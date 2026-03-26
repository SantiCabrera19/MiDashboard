// ─── Google Calendar OAuth2 Callback ────────────────────
// Route Handler (GET) — receives the authorization code from Google,
// exchanges it for access + refresh tokens, and persists them in
// the google_tokens table for the current user.
//
// FLOW:
// 1. User authorizes via Google consent screen
// 2. Google redirects here with ?code=... and optionally ?error=...
// 3. We exchange the code for tokens via Google's token endpoint
// 4. Tokens are upserted into google_tokens (conflict on user_id)
// 5. User is redirected back to /settings?google=connected
//
// WHY a Route Handler and not a Server Action?
// OAuth2 callbacks must be GET endpoints — Server Actions only handle POST.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    // Google returned an error (user denied, etc.)
    if (oauthError || !code) {
        console.error("Google Calendar OAuth error:", oauthError ?? "missing code");
        return NextResponse.redirect(`${origin}/settings?google=error`);
    }

    const supabase = await createClient();

    // Require an active Supabase session — user must already be logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(`${origin}/login`);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!appUrl || !clientId || !clientSecret) {
        console.error("Missing Google OAuth env vars");
        return NextResponse.redirect(`${origin}/settings?google=error`);
    }

    const redirectUri = `${appUrl}/auth/google-calendar/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenRes.ok) {
        const body = await tokenRes.text();
        console.error("Google token exchange failed:", body);
        return NextResponse.redirect(`${origin}/settings?google=error`);
    }

    const tokens = (await tokenRes.json()) as {
        access_token: string;
        refresh_token?: string;
        token_type: string;
        expires_in: number;
        scope: string;
    };

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const now = new Date().toISOString();

    // Upsert — if user already had a token, replace it
    const { error: upsertError } = await supabase.from("google_tokens").upsert(
        {
            user_id: user.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? null,
            token_type: tokens.token_type,
            expires_at: expiresAt,
            scope: tokens.scope,
            updated_at: now,
        },
        { onConflict: "user_id" },
    );

    if (upsertError) {
        console.error("Error saving Google tokens:", upsertError.message);
        return NextResponse.redirect(`${origin}/settings?google=error`);
    }

    return NextResponse.redirect(`${origin}/settings?google=connected`);
}
