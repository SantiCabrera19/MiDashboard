// ─── Videos Data Queries ────────────────────────────────
// Server-side data functions for the YouTube module.
//
// Covers youtube_channels and youtube_videos tables.
// Videos are fetched with their channel info via a join.

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type YouTubeChannel = Tables<"youtube_channels">;
export type YouTubeVideo = Tables<"youtube_videos">;

// Extended type for videos with their channel name (from join)
export type VideoWithChannel = YouTubeVideo & {
    youtube_channels: Pick<YouTubeChannel, "channel_name" | "channel_thumbnail"> | null;
};

/**
 * Fetch latest videos with channel info, ordered by published date.
 */
export async function getLatestVideos(limit: number = 12): Promise<VideoWithChannel[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("youtube_videos")
        .select(`
      *,
      youtube_channels ( channel_name, channel_thumbnail )
    `)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching videos:", error.message);
        return [];
    }

    return data as VideoWithChannel[];
}

/**
 * Fetch all subscribed YouTube channels.
 */
export async function getChannels(): Promise<YouTubeChannel[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("youtube_channels")
        .select()
        .order("channel_name");

    if (error) {
        console.error("Error fetching channels:", error.message);
        return [];
    }

    return data;
}
