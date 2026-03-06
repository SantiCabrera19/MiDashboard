// ─── Notes Data Queries ─────────────────────────────────
// Server-side data functions for the Notes module.
//
// WHY separate data functions?
// - Pages just call getNotes() — they don't know about Supabase internals
// - If we change the DB structure or switch providers, only this file changes
// - Easy to add caching, error handling, or transformations in ONE place
// - TypeScript ensures the return type matches Tables<"notes">
//
// ALL functions use the SERVER client (cookies-based auth).
// This means RLS policies will filter by user automatically in Phase 5.

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

// Re-export the row type for use in components
export type Note = Tables<"notes">;

/**
 * Fetch all notes, ordered by pinned first, then most recently updated.
 */
export async function getNotes(): Promise<Note[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("notes")
        .select()
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching notes:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch a single note by ID.
 * Returns null if not found.
 */
export async function getNoteById(id: string): Promise<Note | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("notes")
        .select()
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching note:", error.message);
        return null;
    }

    return data;
}
