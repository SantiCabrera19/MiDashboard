"use client";

// ─── VideosClient ───────────────────────────────────────
// Client Component — wraps the entire videos UI.
// Handles client-side filtering and "load more" pagination.
//
// WHY client-side filtering (vs searchParams):
// - Video count is bounded (~15/channel × N channels)
// - Instant filter response, no server round-trip
// - Better UX for toggling watched/channel filters

import { useState } from "react";
import { Badge, EmptyState } from "@/components/ui";
import VideoCard from "./VideoCard";
import ChannelBar from "./ChannelBar";
import type { VideoWithChannel, YouTubeChannel } from "@/lib/data/videos";

interface VideosClientProps {
    videos: VideoWithChannel[];
    channels: YouTubeChannel[];
}

const PAGE_SIZE = 12;

export default function VideosClient({
    videos,
    channels,
}: VideosClientProps) {
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
        null
    );
    const [showWatched, setShowWatched] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

    // ─── Filter + Sort ────────────────────────────────
    const filtered = videos
        .filter((v) => {
            // Channel filter
            if (selectedChannelId && v.channel_id !== selectedChannelId) return false;
            // Watched filter (pinned videos always visible)
            if (!showWatched && v.is_watched && !v.is_pinned) return false;
            return true;
        })
        .sort((a, b) => {
            // Pinned first
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            // Then by date (newest first)
            return (
                new Date(b.published_at).getTime() -
                new Date(a.published_at).getTime()
            );
        });

    const displayed = filtered.slice(0, displayLimit);
    const hasMore = displayLimit < filtered.length;
    const pinnedCount = filtered.filter((v) => v.is_pinned).length;
    const watchedCount = videos.filter((v) => v.is_watched).length;
    const unwatchedCount = videos.filter((v) => !v.is_watched).length;

    return (
        <>
            {/* Channel bar */}
            <ChannelBar
                channels={channels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={(id) => {
                    setSelectedChannelId(id);
                    setDisplayLimit(PAGE_SIZE);
                }}
            />

            {/* Filter bar */}
            <div className="mb-4 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-[var(--color-text-muted)]">
                    {filtered.length} video{filtered.length !== 1 ? "s" : ""}
                    {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
                </span>
                <div className="flex-1" />
                <button
                    onClick={() => {
                        setShowWatched(!showWatched);
                        setDisplayLimit(PAGE_SIZE);
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${showWatched
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                        }`}
                >
                    {showWatched ? "👁️ Showing watched" : `👁️‍🗨️ ${watchedCount} watched hidden`}
                </button>
                <Badge variant="info">{unwatchedCount} unwatched</Badge>
            </div>

            {/* Video grid */}
            {displayed.length > 0 ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {displayed.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
                                className="rounded-full px-6 py-2 text-sm font-medium bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] transition-colors"
                            >
                                Load more ({filtered.length - displayLimit} remaining)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    icon="🎬"
                    title={
                        videos.length === 0
                            ? "No videos yet"
                            : showWatched
                                ? "No videos match filters"
                                : "All caught up!"
                    }
                    description={
                        videos.length === 0
                            ? "Follow a YouTube channel to see their latest uploads here."
                            : showWatched
                                ? "Try changing the channel filter."
                                : "You've watched all videos. Toggle 'Show watched' to review them."
                    }
                />
            )}
        </>
    );
}
