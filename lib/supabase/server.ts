// ─── Supabase Server Client (Typed) ─────────────────────
// Creates a Supabase client for Server Components and Server Actions.
//
// WHY typed with <Database>?
// Without the generic, supabase.from("notes").select() returns `any`.
// WITH the generic, it returns the exact Row type from database.types.ts.
// This means: full autocompletion, compile-time type checking, and
// zero chance of typos in column names.
//
// USAGE (in any Server Component):
//   const supabase = await createClient();
//   const { data } = await supabase.from("notes").select();
//   // data is typed as Tables<"notes">[] — no `any`!

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    );
}
