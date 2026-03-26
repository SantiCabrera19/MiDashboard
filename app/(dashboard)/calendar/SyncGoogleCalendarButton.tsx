"use client";

// ─── SyncGoogleCalendarButton ────────────────────────────
// Client Component — triggers a Google Calendar sync from the calendar page.
//
// WHY Client Component?
// - useTransition for non-blocking Server Action call
// - useToast for sync result feedback
//
// Rendered only when Google Calendar is connected (parent decides).

import { useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { syncGoogleCalendarEvents } from "@/lib/actions/google-calendar";

export default function SyncGoogleCalendarButton() {
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    function handleSync() {
        startTransition(async () => {
            const result = await syncGoogleCalendarEvents();
            if (result.success) {
                toast.success(
                    `Synced ${result.count} event${result.count === 1 ? "" : "s"} from Google Calendar`,
                );
            } else {
                toast.error(result.error ?? "Sync failed. Please try again.");
            }
        });
    }

    return (
        <button
            onClick={handleSync}
            disabled={isPending}
            title="Sync with Google Calendar"
            className={`
                inline-flex items-center gap-1.5
                rounded-lg border border-[var(--color-border)]
                bg-[var(--color-surface-2)] px-3 py-1.5
                text-xs font-medium text-[var(--color-text-secondary)]
                transition-colors
                hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]
                disabled:cursor-not-allowed disabled:opacity-50
            `}
        >
            <span className={isPending ? "animate-spin inline-block" : ""}>🔄</span>
            <span className="hidden sm:inline">
                {isPending ? "Syncing..." : "Sync Google"}
            </span>
        </button>
    );
}
