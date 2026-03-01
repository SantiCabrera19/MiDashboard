"use server";

// ─── Videos Server Actions ──────────────────────────────
// Mutations for the YouTube/Videos module.
//
// This module is different from Notes/Finances/Calendar:
// - It interacts with an EXTERNAL API (YouTube Data API v3)
// - Channels are the "parent" entity, videos are fetched from YouTube
// - user_id comes from the youtube_channels table (RLS handles filtering)

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
    fetchChannelInfo,
    fetchChannelVideos,
} from "@/lib/youtube";

type ActionResponse = {
    success: boolean;
    error?: string;
};

/**
 * Follow a YouTube channel by URL or handle.
 *
 * Flow:
 * 1. Parse input → extract channel identifier
 * 2. YouTube API → get channel info (1 unit)
 * 3. Check if already followed
 * 4. Insert channel into DB
 * 5. YouTube API → fetch latest 15 videos (1 unit)
 * 6. Insert videos into DB
 *
 * Total API cost: ~2 units
 */
export async function followChannel(input: string): Promise<ActionResponse> {
    const supabase = await createClient();

    // Step 1: Get authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    try {
        // Step 2: Fetch channel info from YouTube
        const channelInfo = await fetchChannelInfo(input);

        // Step 3: Check if already followed
        const { data: existing } = await supabase
            .from("youtube_channels")
            .select("id")
            .eq("channel_id", channelInfo.channelId)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            return { success: false, error: "You already follow this channel" };
        }

        // Step 4: Insert channel
        const { data: newChannel, error: channelError } = await supabase
            .from("youtube_channels")
            .insert({
                channel_id: channelInfo.channelId,
                channel_name: channelInfo.channelName,
                channel_thumbnail: channelInfo.channelThumbnail,
                user_id: user.id,
                last_checked_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (channelError || !newChannel) {
            console.error("Error inserting channel:", channelError?.message);
            return { success: false, error: "Failed to save channel" };
        }

        // Step 5: Fetch latest videos
        const videos = await fetchChannelVideos(
            channelInfo.uploadsPlaylistId,
            15
        );

        // Step 6: Insert videos (skip duplicates via video_id check)
        if (videos.length > 0) {
            const videoRows = videos.map((v) => ({
                video_id: v.videoId,
                title: v.title,
                thumbnail: v.thumbnail,
                published_at: v.publishedAt,
                channel_id: newChannel.id,
                is_notified: false,
                is_watched: false,
                is_pinned: false,
            }));

            const { error: videoError } = await supabase
                .from("youtube_videos")
                .insert(videoRows);

            if (videoError) {
                console.error("Error inserting videos:", videoError.message);
                // Channel was created but videos failed — not critical
            }
        }

        revalidatePath("/videos");
        return { success: true };
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error following channel:", message);
        return { success: false, error: message };
    }
}

/**
 * Unfollow a channel — deletes the channel and all its videos.
 */
export async function unfollowChannel(
    channelDbId: string
): Promise<ActionResponse> {
    const supabase = await createClient();

    // Delete videos first (no FK cascade in Supabase by default)
    const { error: videosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelDbId);

    if (videosError) {
        console.error("Error deleting channel videos:", videosError.message);
        return { success: false, error: "Failed to remove channel videos" };
    }

    // Then delete the channel
    const { error: channelError } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("id", channelDbId);

    if (channelError) {
        console.error("Error deleting channel:", channelError.message);
        return { success: false, error: "Failed to remove channel" };
    }

    revalidatePath("/videos");
    return { success: true };
}

/**
 * Sync videos for a specific channel — fetches new videos from YouTube.
 */
export async function syncChannelVideos(
    channelDbId: string
): Promise<ActionResponse> {
    const supabase = await createClient();

    try {
        // Get channel info
        const { data: channel, error: chError } = await supabase
            .from("youtube_channels")
            .select("channel_id")
            .eq("id", channelDbId)
            .single();

        if (chError || !channel) {
            return { success: false, error: "Channel not found" };
        }

        // Compute uploads playlist ID: UC... → UU...
        const uploadsPlaylistId = "UU" + channel.channel_id.slice(2);

        // Fetch latest videos from YouTube
        const videos = await fetchChannelVideos(uploadsPlaylistId, 15);

        // Get existing video IDs for this channel
        const { data: existingVideos } = await supabase
            .from("youtube_videos")
            .select("video_id")
            .eq("channel_id", channelDbId);

        const existingIds = new Set(existingVideos?.map((v) => v.video_id) ?? []);

        // Filter to only new videos
        const newVideos = videos.filter((v) => !existingIds.has(v.videoId));

        if (newVideos.length > 0) {
            const videoRows = newVideos.map((v) => ({
                video_id: v.videoId,
                title: v.title,
                thumbnail: v.thumbnail,
                published_at: v.publishedAt,
                channel_id: channelDbId,
                is_notified: false,
                is_watched: false,
                is_pinned: false,
            }));

            const { error: insertError } = await supabase
                .from("youtube_videos")
                .insert(videoRows);

            if (insertError) {
                console.error("Error inserting new videos:", insertError.message);
                return { success: false, error: "Failed to save new videos" };
            }
        }

        // Update last_checked_at
        await supabase
            .from("youtube_channels")
            .update({ last_checked_at: new Date().toISOString() })
            .eq("id", channelDbId);

        revalidatePath("/videos");
        return { success: true };
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Unknown error occurred";
        return { success: false, error: message };
    }
}

/**
 * Sync ALL channels for the current user.
 */
export async function syncAllChannels(): Promise<ActionResponse> {
    const supabase = await createClient();

    const { data: channels, error } = await supabase
        .from("youtube_channels")
        .select("id");

    if (error || !channels) {
        return { success: false, error: "Failed to fetch channels" };
    }

    const results = await Promise.allSettled(
        channels.map((ch) => syncChannelVideos(ch.id))
    );

    const failures = results.filter((r) => r.status === "rejected").length;
    if (failures > 0) {
        return {
            success: true,
            error: `Synced with ${failures} channel(s) failing`,
        };
    }

    return { success: true };
}

/**
 * Toggle watched status of a video.
 */
export async function toggleWatched(videoId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    // Get current status
    const { data: video, error: fetchError } = await supabase
        .from("youtube_videos")
        .select("is_watched")
        .eq("id", videoId)
        .single();

    if (fetchError || !video) {
        return { success: false, error: "Video not found" };
    }

    const newWatched = !video.is_watched;
    const { error: updateError } = await supabase
        .from("youtube_videos")
        .update({
            is_watched: newWatched,
            watched_at: newWatched ? new Date().toISOString() : null,
        })
        .eq("id", videoId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath("/videos");
    return { success: true };
}

/**
 * Toggle pinned status of a video.
 */
export async function togglePinned(videoId: string): Promise<ActionResponse> {
    const supabase = await createClient();

    const { data: video, error: fetchError } = await supabase
        .from("youtube_videos")
        .select("is_pinned")
        .eq("id", videoId)
        .single();

    if (fetchError || !video) {
        return { success: false, error: "Video not found" };
    }

    const { error: updateError } = await supabase
        .from("youtube_videos")
        .update({ is_pinned: !video.is_pinned })
        .eq("id", videoId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath("/videos");
    return { success: true };
}
