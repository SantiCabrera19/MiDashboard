// ─── Calendar Data Queries ──────────────────────────────
// Server-side data functions for the Calendar module.
//
// Handles both calendar_events and custom_events tables.

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type CalendarEvent = Tables<"calendar_events">;
export type CustomEvent = Tables<"custom_events">;

/**
 * Fetch calendar events, ordered by start time.
 * Can optionally filter by date range.
 */
export async function getCalendarEvents(
    startDate?: string,
    endDate?: string
): Promise<CalendarEvent[]> {
    const supabase = await createClient();

    let query = supabase
        .from("calendar_events")
        .select()
        .order("start_time", { ascending: true });

    if (startDate) {
        query = query.gte("start_time", startDate);
    }
    if (endDate) {
        query = query.lte("start_time", endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching calendar events:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch custom events (user-created, not from Google Calendar).
 */
export async function getCustomEvents(): Promise<CustomEvent[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("custom_events")
        .select()
        .order("start_time", { ascending: true });

    if (error) {
        console.error("Error fetching custom events:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch a single calendar event by ID.
 */
export async function getCalendarEventById(
    id: string
): Promise<CalendarEvent | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("calendar_events")
        .select()
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching event:", error.message);
        return null;
    }

    return data;
}
