"use server";

// ─── Notification Server Actions ────────────────────────
// Server-side mutations for marking notifications as read.
//
// WHY Server Actions?
// - Secure: run on the server, not the browser
// - revalidatePath() refreshes cached data after changes

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Mark all unnotified videos for a specific channel as notified.
 * Called when user clicks a video notification.
 */
export async function markVideosNotified(channelId: string): Promise<void> {
    const supabase = await createClient();

    await supabase
        .from("youtube_videos")
        .update({ is_notified: true })
        .eq("channel_id", channelId)
        .eq("is_notified", false);

    revalidatePath("/notifications");
    revalidatePath("/");
}

/**
 * Mark ALL unnotified videos as notified.
 * Called from "Mark all as read" button.
 */
export async function markAllNotificationsRead(): Promise<void> {
    const supabase = await createClient();

    await supabase
        .from("youtube_videos")
        .update({ is_notified: true })
        .eq("is_notified", false);

    revalidatePath("/notifications");
    revalidatePath("/");
}
