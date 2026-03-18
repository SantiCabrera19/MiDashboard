"use client";

// ─── NotificationItemCard ───────────────────────────────
// Client Component — handles click to mark-as-read and navigate.
// Uses useTransition for non-blocking Server Action calls.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markVideosNotified } from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/data/notifications";

interface NotificationItemProps {
    notification: NotificationItem;
}

export default function NotificationItemCard({ notification: n }: NotificationItemProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleClick() {
        if (n.type === "video") {
            // Extract channelId from id format "video-{channelId}"
            const channelId = n.id.replace("video-", "");
            startTransition(async () => {
                await markVideosNotified(channelId);
                router.push(n.href);
            });
        } else {
            router.push(n.href);
        }
    }

    // Format relative timestamp
    function formatTime(iso: string): string {
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`
        w-full text-left
        flex items-start gap-4
        rounded-xl border border-[var(--color-border)]
        bg-[var(--color-surface-1)]
        px-4 py-4
        transition-all duration-200
        hover:bg-[var(--color-surface-2)]
        hover:border-[var(--color-border-hover)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isPending ? "opacity-50" : ""}
      `}
        >
            {/* Icon + unread dot */}
            <div className="relative shrink-0 mt-0.5">
                <span className="text-2xl">{n.icon}</span>
                {!n.isRead && (
                    <span className="
            absolute -top-1 -right-1
            h-2.5 w-2.5 rounded-full
            bg-[var(--color-error)]
            border-2 border-[var(--color-surface-1)]
          " />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`
            text-sm font-semibold truncate
            ${n.isRead
                            ? "text-[var(--color-text-muted)]"
                            : "text-[var(--color-text-primary)]"
                        }
          `}>
                        {n.title}
                    </p>
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0 mt-0.5">
                        {formatTime(n.timestamp)}
                    </span>
                </div>
                <p className={`
          text-xs mt-1
          ${n.isRead
                        ? "text-[var(--color-text-muted)]"
                        : "text-[var(--color-text-secondary)]"
                    }
        `}>
                    {n.description}
                </p>
            </div>

            {/* Arrow */}
            <span className="text-xs text-[var(--color-text-muted)] shrink-0 mt-1">→</span>
        </button>
    );
}
