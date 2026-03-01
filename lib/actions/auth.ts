// ─── Auth Server Actions ────────────────────────────────
// Server-side auth utilities.

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign out the current user and redirect to login.
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

/**
 * Get the current authenticated user.
 * Returns null if not logged in.
 */
export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}
