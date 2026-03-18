// ─── Notifications Page ─────────────────────────────────
// Server Component — fetches on-demand notifications from
// existing tables (videos, calendar, debts).
// Route: /notifications

import type { Metadata } from "next";
import { getNotifications } from "@/lib/data/notifications";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import NotificationItemCard from "./NotificationItem";

export const metadata: Metadata = {
    title: "Notifications",
    description: "Your recent alerts and reminders.",
};

export default async function NotificationsPage() {
    const notifications = await getNotifications();
    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);

    return (
        <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        🔔 Notifications
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {notifications.length === 0
                            ? "You're all caught up"
                            : `${unread.length} unread · ${notifications.length} total`}
                    </p>
                </div>

                {/* Mark all as read button — only shows when there are unread */}
                {unread.length > 0 && (
                    <form action={markAllNotificationsRead}>
                        <button
                            type="submit"
                            className="
                text-xs font-medium
                text-[var(--color-brand)]
                hover:text-[var(--color-brand-hover)]
                transition-colors px-3 py-2 rounded-lg
                hover:bg-[var(--color-surface-2)]
              "
                        >
                            Mark all as read
                        </button>
                    </form>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-12 flex flex-col items-center justify-center gap-3">
                    <span className="text-4xl opacity-30">🔔</span>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        No notifications right now
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] text-center max-w-xs">
                        You&apos;ll see alerts here for upcoming events, new videos, and payment reminders.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Unread section */}
                    {unread.length > 0 && (
                        <div className="space-y-3">
                            {unread.map((n) => (
                                <NotificationItemCard key={n.id} notification={n} />
                            ))}
                        </div>
                    )}

                    {/* Read section — dimmed, with separator */}
                    {read.length > 0 && (
                        <>
                            {unread.length > 0 && (
                                <div className="flex items-center gap-3 py-2">
                                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                                    <span className="text-xs text-[var(--color-text-muted)]">Earlier</span>
                                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                                </div>
                            )}
                            <div className="space-y-3 opacity-60">
                                {read.map((n) => (
                                    <NotificationItemCard key={n.id} notification={n} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
