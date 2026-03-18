// ─── Notifications Page ─────────────────────────────────
// Server Component — fetches on-demand notifications from
// existing tables (videos, calendar, debts).
// Route: /notifications

import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { getNotifications } from "@/lib/data/notifications";

export const metadata: Metadata = {
    title: "Notifications",
    description: "Your recent alerts and reminders.",
};

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    return (
        <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    🔔 Notifications
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {notifications.length === 0
                        ? "You're all caught up"
                        : `${notifications.length} alert${notifications.length !== 1 ? "s" : ""}`}
                </p>
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <span className="text-4xl opacity-40">🔔</span>
                        <p className="text-sm font-medium text-[var(--color-text-muted)]">
                            No notifications right now
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] text-center max-w-xs">
                            You&apos;ll see alerts here for upcoming events, new videos, and
                            payment reminders.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <Link key={n.id} href={n.href}>
                            <Card
                                interactive
                                className="flex items-start gap-4"
                            >
                                <span className="text-2xl shrink-0 mt-0.5">{n.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                        {n.description}
                                    </p>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)] shrink-0 mt-0.5">
                                    →
                                </span>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
