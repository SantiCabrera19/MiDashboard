// ─── Supabase Browser Client (Typed) ────────────────────
// Creates a Supabase client for Client Components.
//
// Same <Database> generic as server.ts — consistent types everywhere.
// Used in Client Components that need real-time subscriptions or
// client-side mutations (e.g., optimistic updates).
//
// USAGE (in a "use client" component):
//   const supabase = createClient();
//   supabase.from("notes").on("INSERT", callback);

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
