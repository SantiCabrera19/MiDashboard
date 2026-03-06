"use client";

// ─── ChannelBar ─────────────────────────────────────────
// Client Component — horizontal list of followed channels.
// Shows channel thumbnails, sync button, unfollow.
// Also includes the "Follow Channel" button.

import { useState, useTransition } from "react";
import { Button, useToast } from "@/components/ui";
import {
    unfollowChannel,
    syncChannelVideos,
    syncAllChannels,
} from "@/lib/actions/videos";
import ChannelForm from "./ChannelForm";
import type { YouTubeChannel } from "@/lib/data/videos";

interface ChannelBarProps {
    channels: YouTubeChannel[];
    selectedChannelId: string | null;
    onSelectChannel: (id: string | null) => void;
}

export default function ChannelBar({
    channels,
    selectedChannelId,
    onSelectChannel,
}: ChannelBarProps) {
    const [showForm, setShowForm] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [isSyncingAll, startSyncAll] = useTransition();
    const toast = useToast();

    function handleSync(channelId: string) {
        setSyncingId(channelId);
        syncChannelVideos(channelId)
            .then(() => toast.success("Channel synced"))
            .catch(() => toast.error("Sync failed"))
            .finally(() => setSyncingId(null));
    }

    function handleSyncAll() {
        startSyncAll(async () => {
            await syncAllChannels();
            toast.success("All channels synced");
        });
    }

    return (
        <>
            <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
                {/* All channels button */}
                <button
                    onClick={() => onSelectChannel(null)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${selectedChannelId === null
                        ? "bg-[var(--color-brand)] text-white"
                        : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                        }`}
                >
                    All
                </button>

                {/* Channel pills */}
                {channels.map((ch) => (
                    <div key={ch.id} className="group relative shrink-0">
                        <button
                            onClick={() =>
                                onSelectChannel(
                                    selectedChannelId === ch.id ? null : ch.id
                                )
                            }
                            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${selectedChannelId === ch.id
                                ? "bg-[var(--color-brand)] text-white"
                                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                                }`}
                        >
                            {ch.channel_thumbnail && (
                                <img
                                    src={ch.channel_thumbnail}
                                    alt=""
                                    className="h-5 w-5 rounded-full"
                                />
                            )}
                            <span className="max-w-[120px] truncate">{ch.channel_name}</span>
                            {syncingId === ch.id && (
                                <span className="animate-spin text-xs">🔄</span>
                            )}
                        </button>

                        {/* Hover actions */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-1 shadow-lg z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSync(ch.id);
                                }}
                                className="rounded px-2 py-0.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors"
                                title="Sync videos"
                            >
                                🔄
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Unfollow ${ch.channel_name}?`)) {
                                        unfollowChannel(ch.id).then(() =>
                                            toast.success(`Unfollowed ${ch.channel_name}`)
                                        );
                                    }
                                }}
                                className="rounded px-2 py-0.5 text-xs hover:bg-red-500/10 text-red-400 transition-colors"
                                title="Unfollow"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                {/* Sync All + Follow buttons */}
                {channels.length > 0 && (
                    <button
                        onClick={handleSyncAll}
                        disabled={isSyncingAll}
                        className="shrink-0 rounded-full px-3 py-1.5 text-sm bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] transition-all disabled:opacity-50"
                        title="Sync all channels"
                    >
                        {isSyncingAll ? "Syncing..." : "🔄 Sync All"}
                    </button>
                )}

                <Button size="sm" onClick={() => setShowForm(true)} className="shrink-0">
                    + Follow
                </Button>
            </div>

            <ChannelForm open={showForm} onClose={() => setShowForm(false)} />
        </>
    );
}
