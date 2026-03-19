// ─── Highscores Data Queries ────────────────────────────
// Server-side data functions for the Minesweeper highscores.
//
// NOTE: The `highscores` table is not yet in database.types.ts.
// Once `npx supabase gen types` is run, these casts can be removed.
// For now, we use the untyped Supabase JS client directly.

import { createClient as createUntypedClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Highscore = {
    id: string;
    user_id: string;
    difficulty: "easy" | "medium" | "hard";
    time_seconds: number;
    created_at: string;
};

/**
 * Fetch top 10 personal highscores for a given difficulty.
 * Uses untyped client because `highscores` table is not in generated types yet.
 */
export async function getHighscores(
    difficulty: "easy" | "medium" | "hard"
): Promise<Highscore[]> {
    // Get user from typed client (uses cookies for auth)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Use untyped client for the highscores table
    const untyped = createUntypedClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await untyped
        .from("highscores")
        .select("*")
        .eq("user_id", user.id)
        .eq("difficulty", difficulty)
        .order("time_seconds", { ascending: true })
        .limit(10);

    if (error) {
        console.error("Error fetching highscores:", error.message);
        return [];
    }

    return (data ?? []) as Highscore[];
}
