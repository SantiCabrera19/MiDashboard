"use client";

// ─── VideoCard ──────────────────────────────────────────
// Client Component — displays a single video with actions.
// Hover reveals pin/watch/open actions.

import { useTransition } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { toggleWatched, togglePinned } from "@/lib/actions/videos";
import type { VideoWithChannel } from "@/lib/data/videos";

interface VideoCardProps {
    video: VideoWithChannel;
}

export default function VideoCard({ video }: VideoCardProps) {
    const [isPending, startTransition] = useTransition();

    function handleToggleWatch() {
        startTransition(async () => {
            await toggleWatched(video.id);
        });
    }

    function handleTogglePin() {
        startTransition(async () => {
            await togglePinned(video.id);
        });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${video.video_id}`;

    return (
        <div
            className={`group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] transition-all hover:border-[var(--color-border-hover)] ${isPending ? "opacity-50" : ""
                } ${video.is_watched ? "opacity-60" : ""}`}
        >
            {/* Thumbnail */}
            <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-video bg-[var(--color-surface-3)] overflow-hidden"
            >
                {video.thumbnail ? (
                    <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                        ▶
                    </div>
                )}

                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex gap-1">
                    {video.is_pinned && <Badge variant="warning">📌 Pinned</Badge>}
                    {!video.is_watched && !video.is_notified && (
                        <Badge variant="info">New</Badge>
                    )}
                </div>

                {video.is_watched && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-2xl">✅</span>
                    </div>
                )}
            </a>

            {/* Video info */}
            <div className="p-3">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-tight">
                    {video.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-secondary)] truncate">
                        {video.youtube_channels?.channel_name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                        • {new Date(video.published_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleTogglePin}
                    disabled={isPending}
                    className={`rounded-lg p-1.5 text-xs backdrop-blur-sm transition-colors ${video.is_pinned
                            ? "bg-amber-500/30 text-amber-300"
                            : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title={video.is_pinned ? "Unpin" : "Pin"}
                >
                    📌
                </button>
                <button
                    onClick={handleToggleWatch}
                    disabled={isPending}
                    className={`rounded-lg p-1.5 text-xs backdrop-blur-sm transition-colors ${video.is_watched
                            ? "bg-emerald-500/30 text-emerald-300"
                            : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title={video.is_watched ? "Mark unwatched" : "Mark watched"}
                >
                    {video.is_watched ? "👁️" : "👁️‍🗨️"}
                </button>
                <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-xs bg-red-600/80 text-white hover:bg-red-600 backdrop-blur-sm transition-colors"
                    title="Open in YouTube"
                >
                    ▶
                </a>
            </div>
        </div>
    );
}
