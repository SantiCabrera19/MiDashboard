"use server";

// ─── Calendar Server Actions ────────────────────────────
// Mutations for the Calendar module.
//
// NOTE: calendar_events.user_id is NOT NULL, unlike notes/transactions.
// We explicitly pass user.id from auth rather than relying on DB default.
// This is more robust and satisfies TypeScript strict typing.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResponse = {
    success: boolean;
    error?: string;
};

interface EventPayload {
    title: string;
    description?: string | null;
    start_time: string;
    end_time?: string | null;
    all_day?: boolean;
    event_type?: string | null;
    color?: string | null;
    reminder_minutes?: number | null;
}

/**
 * Create a new calendar event.
 */
export async function createEvent(data: EventPayload): Promise<ActionResponse> {
    const supabase = await createClient();

    // Get authenticated user — calendar_events.user_id is NOT NULL
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("calendar_events").insert({
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time || null,
        all_day: data.all_day ?? false,
        event_type: data.event_type || null,
        color: data.color || null,
        reminder_minutes: data.reminder_minutes ?? null,
        user_id: user.id,
        source: "manual",
    });

    if (error) {
        console.error("Error creating event:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/calendar");
    return { success: true };
}

/**
 * Update an existing calendar event.
 */
export async function updateEvent(
    id: string,
    data: EventPayload
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("calendar_events")
        .update({
            title: data.title,
            description: data.description || null,
            start_time: data.start_time,
            end_time: data.end_time || null,
            all_day: data.all_day ?? false,
            event_type: data.event_type || null,
            color: data.color || null,
            reminder_minutes: data.reminder_minutes ?? null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating event:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/calendar");
    return { success: true };
}

/**
 * Delete a calendar event by ID.
 */
export async function deleteEvent(id: string): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting event:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/calendar");
    return { success: true };
}
