"use client";

// ─── ActivityCarousel ───────────────────────────────────
// Client Component — horizontal swipeable carousel of recent
// activity (notes, transactions, events) for mobile only.
//
// WHY "use client"?
// - Scroll snap and touch interactions need browser APIs
// - The Server Component (home/page.tsx) passes data as props
//   — zero extra DB queries

import { useState, useRef } from "react";
import Link from "next/link";
import type { Note } from "@/lib/data/notes";
import type { Transaction } from "@/lib/data/transactions";
import type { CalendarEvent } from "@/lib/data/calendar";

type ActivityItem =
    | { kind: "note"; data: Note }
    | { kind: "transaction"; data: Transaction }
    | { kind: "event"; data: CalendarEvent };

interface ActivityCarouselProps {
    notes: Note[];
    transactions: Transaction[];
    events: CalendarEvent[];
}

function getTimestamp(item: ActivityItem): number {
    switch (item.kind) {
        case "note":
            return new Date(item.data.updated_at ?? item.data.created_at ?? "").getTime();
        case "transaction":
            return new Date(item.data.transaction_date).getTime();
        case "event":
            return new Date(item.data.start_time).getTime();
    }
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function ActivityCarousel({
    notes,
    transactions,
    events,
}: ActivityCarouselProps) {
    // Build unified activity list — take most recent 3 from each
    const items: ActivityItem[] = [
        ...notes.slice(0, 3).map((n): ActivityItem => ({ kind: "note", data: n })),
        ...transactions.slice(0, 3).map((t): ActivityItem => ({ kind: "transaction", data: t })),
        ...events.slice(0, 3).map((e): ActivityItem => ({ kind: "event", data: e })),
    ];

    // Sort by most recent first
    items.sort((a, b) => getTimestamp(b) - getTimestamp(a));

    // Take top 6
    const feed = items.slice(0, 6);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || feed.length === 0) return;
        const cardWidth = el.scrollWidth / feed.length;
        const idx = Math.round(el.scrollLeft / cardWidth);
        setActiveIndex(Math.min(Math.max(idx, 0), feed.length - 1));
    };

    if (feed.length === 0) return null;

    return (
        <div className="lg:hidden">
            {/* Section header */}
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    ⚡ Recent Activity
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">
                    Swipe →
                </span>
            </div>

            {/* Carousel container — scroll snap */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto pb-2"
                style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {feed.map((item, index) => (
                    <ActivityCard key={index} item={item} />
                ))}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center items-center gap-1.5 mt-3">
                {feed.map((_, i) => (
                    <div
                        key={i}
                        className={
                            i === activeIndex
                                ? "h-1.5 w-4 rounded-full bg-[var(--color-brand)] transition-all duration-200"
                                : "h-1 w-1 rounded-full bg-[var(--color-border)] transition-all duration-200"
                        }
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Individual Activity Cards ──────────────────────────

function ActivityCard({ item }: { item: ActivityItem }) {
    if (item.kind === "note") {
        const note = item.data;
        return (
            <Link
                href={`/notes/${note.id}`}
                className="block shrink-0"
                style={{ scrollSnapAlign: "start", width: "72vw", maxWidth: "260px" }}
            >
                <div className="
                    h-full rounded-xl border border-[var(--color-border)]
                    bg-[var(--color-surface-1)] p-4
                    transition-colors active:bg-[var(--color-surface-2)]
                ">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">📝</span>
                        <span className="text-xs font-medium text-[var(--color-brand)]">Note</span>
                        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                            {formatDate(note.updated_at ?? note.created_at ?? "")}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2">
                        {note.title || "Untitled"}
                    </p>
                </div>
            </Link>
        );
    }

    if (item.kind === "transaction") {
        const tx = item.data;
        const isIncome = tx.type === "income";
        return (
            <Link
                href="/finances"
                className="block shrink-0"
                style={{ scrollSnapAlign: "start", width: "72vw", maxWidth: "260px" }}
            >
                <div className="
                    h-full rounded-xl border border-[var(--color-border)]
                    bg-[var(--color-surface-1)] p-4
                    transition-colors active:bg-[var(--color-surface-2)]
                ">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{isIncome ? "📈" : "📉"}</span>
                        <span className="text-xs font-medium text-[var(--color-brand)]">
                            {isIncome ? "Income" : "Expense"}
                        </span>
                        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                            {formatDate(tx.transaction_date)}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                        {tx.description || "Transaction"}
                    </p>
                    <p className={`mt-1 text-base font-bold ${isIncome ? "text-emerald-400" : "text-red-400"}`}>
                        {isIncome ? "+" : "-"}${Number(tx.amount).toLocaleString("es-AR")}
                    </p>
                </div>
            </Link>
        );
    }

    // event
    const ev = item.data;
    return (
        <Link
            href="/calendar"
            className="block shrink-0"
            style={{ scrollSnapAlign: "start", width: "72vw", maxWidth: "260px" }}
        >
            <div className="
                h-full rounded-xl border border-[var(--color-border)]
                bg-[var(--color-surface-1)] p-4
                transition-colors active:bg-[var(--color-surface-2)]
            ">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📅</span>
                    <span className="text-xs font-medium text-[var(--color-brand)]">Event</span>
                    <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                        {formatDate(ev.start_time)}
                    </span>
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2">
                    {ev.title}
                </p>
                {ev.event_type && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {ev.event_type}
                    </p>
                )}
            </div>
        </Link>
    );
}
