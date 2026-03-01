// ─── Videos Page ────────────────────────────────────────
// Server Component — fetches channels and videos from Supabase.
// Route: /videos
//
// ARCHITECTURE:
// Server Component fetches all data (channels + videos with joins).
// VideosClient handles client-side filtering, sorting, and pagination.
// This avoids server round-trips for interactive filters.

import type { Metadata } from "next";
import { getLatestVideos, getChannels } from "@/lib/data/videos";
import VideosClient from "./VideosClient";

export const metadata: Metadata = {
    title: "Videos",
    description: "Track YouTube channels and latest video uploads.",
};

export default async function VideosPage() {
    // Parallel fetch
    const [videos, channels] = await Promise.all([
        getLatestVideos(100), // Fetch up to 100 videos, client paginates
        getChannels(),
    ]);

    return (
        <div>
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    🎬 Videos
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {videos.length} video{videos.length !== 1 ? "s" : ""} from{" "}
                    {channels.length} channel{channels.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Client-side interactive UI */}
            <VideosClient videos={videos} channels={channels} />
        </div>
    );
}
