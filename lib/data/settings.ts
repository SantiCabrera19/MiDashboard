// ─── Settings Data Fetchers ─────────────────────────────
// Server-side data fetching for the Settings page.
//
// WHY separate from actions?
// - Data fetchers are pure reads — no mutations, no revalidation
// - Used by Server Components to pass data as props
// - Actions handle writes and are called from Client Components

import { createClient } from "@/lib/supabase/server";

// ─── Type Definitions ───────────────────────────────────
// Strict TypeScript interfaces for the JSONB fields in user_preferences.
// These ensure compile-time safety when reading/writing preferences.

export interface VisibleStatCards {
    notes: boolean;
    balance: boolean;
    events: boolean;
    videos: boolean;
}

export interface VisibleSections {
    recent_notes: boolean;
    upcoming_events: boolean;
    recent_transactions: boolean;
}

export interface NotificationPrefs {
    calendar_events: boolean;
    new_videos: boolean;
    finances: boolean;
    notes_reminders: boolean;
}

export interface UserProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface UserPreferences {
    id: string;
    visible_stat_cards: VisibleStatCards;
    visible_sections: VisibleSections;
    notification_prefs: NotificationPrefs;
}

// ─── Defaults ───────────────────────────────────────────
// Used when no preferences row exists yet (first-time user).

export const DEFAULT_STAT_CARDS: VisibleStatCards = {
    notes: true,
    balance: true,
    events: true,
    videos: true,
};

export const DEFAULT_SECTIONS: VisibleSections = {
    recent_notes: true,
    upcoming_events: true,
    recent_transactions: true,
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
    calendar_events: true,
    new_videos: true,
    finances: true,
    notes_reminders: true,
};

// ─── Fetchers ───────────────────────────────────────────

/**
 * Get the user's profile (display_name, avatar_url).
 * Returns null if no profile row exists.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) return null;

    return data;
}

/**
 * Get the user's preferences (widget visibility, notification prefs).
 * Returns sensible defaults if no preferences row exists.
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) {
        // Return defaults for first-time users
        return {
            id: user.id,
            visible_stat_cards: { ...DEFAULT_STAT_CARDS },
            visible_sections: { ...DEFAULT_SECTIONS },
            notification_prefs: { ...DEFAULT_NOTIFICATION_PREFS },
        };
    }

    // Merge with defaults to handle any missing keys in the JSONB
    return {
        id: data.id,
        visible_stat_cards: {
            ...DEFAULT_STAT_CARDS,
            ...(data.visible_stat_cards as Partial<VisibleStatCards> | null),
        },
        visible_sections: {
            ...DEFAULT_SECTIONS,
            ...(data.visible_sections as Partial<VisibleSections> | null),
        },
        notification_prefs: {
            ...DEFAULT_NOTIFICATION_PREFS,
            ...(data.notification_prefs as Partial<NotificationPrefs> | null),
        },
    };
}
