// ─── Videos Page ────────────────────────────────────────
// Server Component — fetches REAL videos from Supabase.
// Route: /videos
//
// Uses getLatestVideos() which includes a JOIN with youtube_channels
// to get the channel name in a single query.

import type { Metadata } from "next";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { getLatestVideos } from "@/lib/data/videos";

export const metadata: Metadata = {
    title: "Videos",
    description: "Track YouTube channels and latest video uploads.",
};

export default async function VideosPage() {
    const videos = await getLatestVideos();

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        🎬 Videos
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {videos.length} {videos.length === 1 ? "video" : "videos"} from your channels
                    </p>
                </div>
                <Button size="sm" variant="secondary">+ Follow Channel</Button>
            </div>

            {/* Video grid */}
            {videos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <Card key={video.id} interactive noPadding>
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-[var(--color-surface-3)] overflow-hidden">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                                        ▶
                                    </div>
                                )}
                                {!video.is_notified && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="warning">New</Badge>
                                    </div>
                                )}
                            </div>

                            {/* Video info */}
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2">
                                    {video.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                        {video.youtube_channels?.channel_name ?? "Unknown channel"}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        • {new Date(video.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="🎬"
                    title="No videos yet"
                    description="Follow a YouTube channel to see their latest uploads here."
                />
            )}
        </div>
    );
}
