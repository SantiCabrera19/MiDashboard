"use server";

// ─── Settings Server Actions ────────────────────────────
// Server-side mutations for the Settings page.
//
// WHY Server Actions?
// - Secure: run on the server, not the browser
// - Type-safe: accept typed params, return typed responses
// - revalidatePath() refreshes cached data after changes
//
// PATTERN:
// 1. Client Component calls updateProfile({ display_name: "..." })
// 2. Server Action validates + writes to Supabase
// 3. revalidatePath() invalidates cached pages
// 4. Updated data flows through on next render

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type {
    VisibleStatCards,
    VisibleSections,
    NotificationPrefs,
} from "@/lib/data/settings";

// ─── Typed Response ─────────────────────────────────────
type ActionResponse = {
    success: boolean;
    error?: string;
};

// ─── Validation ─────────────────────────────────────────
// Display name: alphanumeric, spaces, common punctuation.
// Max 50 chars to prevent layout breakage.
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_.áéíóúüñÁÉÍÓÚÜÑ]{1,50}$/;

/**
 * Update the user's profile (display_name and/or avatar_url).
 */
export async function updateProfile(data: {
    display_name?: string | null;
    avatar_url?: string | null;
}): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Validate display_name if provided
        if (data.display_name !== undefined && data.display_name !== null) {
            const trimmed = data.display_name.trim();
            if (trimmed.length === 0) {
                // Allow clearing — will fall back to Google name
                data.display_name = null;
            } else if (!DISPLAY_NAME_REGEX.test(trimmed)) {
                return {
                    success: false,
                    error: "Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods (max 50 characters)",
                };
            } else {
                data.display_name = trimmed;
            }
        }

        // Upsert — create profile if it doesn't exist, update if it does
        const { error } = await supabase.from("user_profiles").upsert(
            {
                id: user.id,
                display_name: data.display_name,
                avatar_url: data.avatar_url,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/settings");
        revalidatePath("/home");
        // Layout re-renders on navigation, picking up new sidebar data
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update widget visibility and notification preferences.
 */
export async function updatePreferences(data: {
    visible_stat_cards?: VisibleStatCards;
    visible_sections?: VisibleSections;
    notification_prefs?: NotificationPrefs;
}): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Build the upsert object — cast JSONB fields to satisfy Supabase types
        type PrefsInsert = {
            id: string;
            updated_at: string;
            visible_stat_cards?: Json;
            visible_sections?: Json;
            notification_prefs?: Json;
        };

        const upsertData: PrefsInsert = {
            id: user.id,
            updated_at: new Date().toISOString(),
        };

        if (data.visible_stat_cards !== undefined) {
            upsertData.visible_stat_cards = data.visible_stat_cards as unknown as Json;
        }
        if (data.visible_sections !== undefined) {
            upsertData.visible_sections = data.visible_sections as unknown as Json;
        }
        if (data.notification_prefs !== undefined) {
            upsertData.notification_prefs = data.notification_prefs as unknown as Json;
        }

        // Upsert — create preferences if they don't exist, update if they do
        const { error } = await supabase
            .from("user_preferences")
            .upsert(upsertData, { onConflict: "id" });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/settings");
        revalidatePath("/home");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}
