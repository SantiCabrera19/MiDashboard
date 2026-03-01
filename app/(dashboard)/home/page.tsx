// ─── Dashboard Home ─────────────────────────────────────
// Server Component — the main landing page of MeDashboard.
// Route: /home
//
// ARCHITECTURE:
// Fetches summary data from ALL modules in parallel (Promise.all).
// Renders "glanceable" widgets — user sees their full status in 2 seconds.
// GitHub-inspired color scheme: clean, muted, professional borders.

import type { Metadata } from "next";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { getUser } from "@/lib/actions/auth";
import { getNotes } from "@/lib/data/notes";
import { getTransactions, getMonthlySummary } from "@/lib/data/transactions";
import { getCalendarEvents } from "@/lib/data/calendar";
import { getLatestVideos, getChannels } from "@/lib/data/videos";

export const metadata: Metadata = {
    title: "Home — MeDashboard",
    description: "Your personal dashboard at a glance.",
};

export default async function HomePage() {
    // Parallel fetch — all modules at once
    const [user, notes, transactions, monthlySummary, events, videos, channels] =
        await Promise.all([
            getUser(),
            getNotes(),
            getTransactions(5),
            getMonthlySummary(),
            getCalendarEvents(),
            getLatestVideos(100),
            getChannels(),
        ]);

    // ─── Computed values ────────────────────────────────
    const userName =
        user?.user_metadata?.full_name?.split(" ")[0] ??
        user?.email?.split("@")[0] ??
        "there";

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayEvents = events.filter((e) => {
        const d = new Date(e.start_time);
        return d >= todayStart && d < todayEnd;
    });

    const upcomingEvents = events
        .filter((e) => new Date(e.start_time) >= todayEnd)
        .slice(0, 5);

    const currentMonth = monthlySummary[0];
    const monthIncome = Number(currentMonth?.total_income ?? 0);
    const monthExpenses = Number(currentMonth?.total_expenses ?? 0);
    const monthBalance = monthIncome - monthExpenses;

    const unwatchedVideos = videos.filter((v) => !v.is_watched);
    const pinnedNotes = notes.filter((n) => n.pinned);
    const recentNotes = notes.slice(0, 5);

    // Date formatting
    const dateStr = now.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const greeting =
        now.getHours() < 12
            ? "Buenos días"
            : now.getHours() < 18
                ? "Buenas tardes"
                : "Buenas noches";

    return (
        <div className="space-y-8">
            {/* ─── Header ──────────────────────────────────── */}
            <div className="border-b border-[var(--color-border)] pb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {greeting}, {userName} 👋
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)] capitalize">
                    {dateStr}
                </p>
            </div>

            {/* ─── Stat Cards ──────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Notes */}
                <Link href="/notes">
                    <Card interactive className="group">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">📝</span>
                            <Badge>{pinnedNotes.length} pinned</Badge>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
                            {notes.length}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Total notes
                        </p>
                    </Card>
                </Link>

                {/* Balance */}
                <Link href="/finances">
                    <Card interactive className="group">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">💰</span>
                            <Badge variant={monthBalance >= 0 ? "success" : "error"}>
                                {monthBalance >= 0 ? "↑" : "↓"} this month
                            </Badge>
                        </div>
                        <p
                            className={`mt-3 text-2xl font-bold ${monthBalance >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                        >
                            ${Math.abs(monthBalance).toLocaleString()}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Net balance
                        </p>
                    </Card>
                </Link>

                {/* Today&apos;s Events */}
                <Link href="/calendar">
                    <Card interactive className="group">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">📅</span>
                            {todayEvents.length > 0 && (
                                <Badge variant="info">{todayEvents.length} today</Badge>
                            )}
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
                            {events.length}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Total events
                        </p>
                    </Card>
                </Link>

                {/* Unwatched Videos */}
                <Link href="/videos">
                    <Card interactive className="group">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">🎬</span>
                            <Badge>{channels.length} channels</Badge>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
                            {unwatchedVideos.length}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Unwatched videos
                        </p>
                    </Card>
                </Link>
            </div>

            {/* ─── Content Grid ────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Notes */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            📝 Recent Notes
                        </h2>
                        <Link
                            href="/notes"
                            className="text-xs text-[var(--color-brand)] hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                    <Card>
                        {recentNotes.length > 0 ? (
                            <ul className="divide-y divide-[var(--color-border)]">
                                {recentNotes.map((note) => (
                                    <li key={note.id}>
                                        <Link
                                            href={`/notes/${note.id}`}
                                            className="flex items-center gap-3 py-2.5 hover:bg-[var(--color-surface-2)] -mx-4 px-4 transition-colors rounded"
                                        >
                                            {note.pinned && <span className="text-xs">📌</span>}
                                            <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate">
                                                {note.title || "Untitled"}
                                            </span>
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {new Date(
                                                    note.updated_at ?? note.created_at ?? ""
                                                ).toLocaleDateString("es-AR", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
                                No notes yet
                            </p>
                        )}
                    </Card>
                </section>

                {/* Upcoming Events */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            📅 Upcoming Events
                        </h2>
                        <Link
                            href="/calendar"
                            className="text-xs text-[var(--color-brand)] hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                    <Card>
                        {todayEvents.length + upcomingEvents.length > 0 ? (
                            <ul className="divide-y divide-[var(--color-border)]">
                                {todayEvents.map((event) => (
                                    <li
                                        key={event.id}
                                        className="flex items-center gap-3 py-2.5"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    event.color ?? "var(--color-brand)",
                                            }}
                                        />
                                        <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate">
                                            {event.title}
                                        </span>
                                        <Badge variant="success">Today</Badge>
                                    </li>
                                ))}
                                {upcomingEvents.map((event) => (
                                    <li
                                        key={event.id}
                                        className="flex items-center gap-3 py-2.5"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    event.color ?? "var(--color-brand)",
                                            }}
                                        />
                                        <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate">
                                            {event.title}
                                        </span>
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {new Date(event.start_time).toLocaleDateString(
                                                "es-AR",
                                                { day: "numeric", month: "short" }
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
                                No upcoming events
                            </p>
                        )}
                    </Card>
                </section>
            </div>

            {/* ─── Recent Transactions ─────────────────────── */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        💰 Recent Transactions
                    </h2>
                    <Link
                        href="/finances"
                        className="text-xs text-[var(--color-brand)] hover:underline"
                    >
                        View all →
                    </Link>
                </div>
                <Card>
                    {transactions.length > 0 ? (
                        <ul className="divide-y divide-[var(--color-border)]">
                            {transactions.map((tx) => (
                                <li
                                    key={tx.id}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm">
                                            {tx.type === "income" ? "📈" : "📉"}
                                        </span>
                                        <span className="text-sm text-[var(--color-text-primary)] truncate max-w-[200px]">
                                            {tx.description || "Transaction"}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${tx.type === "income"
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {tx.type === "income" ? "+" : "-"}$
                                        {Number(tx.amount).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
                            No transactions yet
                        </p>
                    )}
                </Card>
            </section>

            {/* ─── Footer ──────────────────────────────────── */}
            <footer className="border-t border-[var(--color-border)] pt-6 pb-4">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <p>
                        Built by{" "}
                        <a
                            href="https://github.com/SantiCabrera19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            Santiago Emanuel Cabrera
                        </a>
                    </p>
                    <a
                        href="https://github.com/SantiCabrera19"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        <svg
                            viewBox="0 0 16 16"
                            className="h-4 w-4 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        @SantiCabrera19
                    </a>
                </div>
            </footer>
        </div>
    );
}
