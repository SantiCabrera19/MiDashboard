"use server";

// ─── Notes Server Actions ───────────────────────────────
// Server-side mutations for the Notes module.
//
// WHY Server Actions?
// - They run on the server, not the browser (secure)
// - Can be called directly from Client Components
// - revalidatePath() refreshes page data WITHOUT full reload
// - Type-safe: accept typed params, return typed responses
// - Work with progressive enhancement (forms work without JS)
//
// FLOW:
// 1. Client Component calls createNote(formData)
// 2. Server Action runs on the server
// 3. Supabase mutation is executed
// 4. revalidatePath("/notes") invalidates cached data
// 5. The Server Component re-fetches fresh data
// 6. Page updates seamlessly — sidebar/layout persist

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

// Typed response for all actions — consistent error handling
type ActionResponse = {
    success: boolean;
    error?: string;
};

/**
 * Create a new note.
 */
export async function createNote(
    data: Pick<TablesInsert<"notes">, "title" | "content" | "is_markdown" | "tags">
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase.from("notes").insert({
        title: data.title || null,
        content: data.content,
        is_markdown: data.is_markdown ?? false,
        pinned: false,
        tags: data.tags ?? [],
    });

    if (error) {
        console.error("Error creating note:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/notes");
    return { success: true };
}

/**
 * Update an existing note.
 */
export async function updateNote(
    id: string,
    data: Pick<TablesUpdate<"notes">, "title" | "content" | "is_markdown" | "tags">
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("notes")
        .update({
            title: data.title || null,
            content: data.content,
            is_markdown: data.is_markdown,
            tags: data.tags ?? [],
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating note:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/notes");
    revalidatePath(`/notes/${id}`);
    return { success: true };
}

/**
 * Delete a note by ID.
 */
export async function deleteNote(id: string): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting note:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/notes");
    return { success: true };
}

/**
 * Toggle the pinned status of a note.
 */
export async function togglePin(
    id: string,
    currentlyPinned: boolean
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("notes")
        .update({
            pinned: !currentlyPinned,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error toggling pin:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/notes");
    return { success: true };
}
