"use server";

// ─── Highscore Server Actions ───────────────────────────
// Save Minesweeper completion times to Supabase.
//
// NOTE: Uses untyped Supabase client because `highscores` table
// is not yet in database.types.ts. Run `npx supabase gen types`
// after creating the table to enable proper typing.

import { createClient as createUntypedClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResponse = { success: boolean; error?: string };

/**
 * Save a new highscore after winning a Minesweeper game.
 */
export async function saveHighscore(
    difficulty: "easy" | "medium" | "hard",
    timeSeconds: number
): Promise<ActionResponse> {
    try {
        // Get user from typed client (session cookies)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        // Use untyped client for insert
        const untyped = createUntypedClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await untyped.from("highscores").insert({
            user_id: user.id,
            difficulty,
            time_seconds: timeSeconds,
        });

        if (error) return { success: false, error: error.message };
        revalidatePath("/games/minesweeper");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}
