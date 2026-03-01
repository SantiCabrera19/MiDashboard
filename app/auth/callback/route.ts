// ─── Auth Callback Route ────────────────────────────────
// Route Handler (GET) — processes the OAuth callback from Supabase.
// Route: /auth/callback
//
// FLOW:
// 1. User clicks "Login with Google" → Supabase redirects to Google
// 2. Google authenticates → redirects to Supabase callback URL
// 3. Supabase processes the token → redirects here with a `code` query param
// 4. This route exchanges the `code` for a session (cookies are set)
// 5. User is redirected to /notes (or wherever `next` param says)
//
// WHY a Route Handler?
// This runs on the server — it securely exchanges the auth code
// for a session. The session is stored in cookies, which are
// automatically sent with every request to our Server Components.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/notes";

    if (code) {
        const supabase = await createClient();

        // Exchange the auth code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success — redirect to the dashboard
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Error — redirect to login with error message
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
