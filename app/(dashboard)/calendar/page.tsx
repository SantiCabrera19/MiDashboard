// ─── Calendar Page ──────────────────────────────────────
// Server Component — fetches REAL calendar events from Supabase.
// Route: /calendar
//
// ARCHITECTURE:
// Events are grouped by temporal proximity:
// - Today: events happening today
// - Upcoming: future events
// - Past: events that already happened
//
// This gives the user immediate context without manual filtering.

import type { Metadata } from "next";
import { EmptyState } from "@/components/ui";
import { getCalendarEvents } from "@/lib/data/calendar";
import type { CalendarEvent } from "@/lib/data/calendar";
import EventCard from "./EventCard";
import NewEventButton from "./NewEventButton";

export const metadata: Metadata = {
    title: "Calendar",
    description: "Manage events, reminders, and sync with Google Calendar.",
};

/**
 * Group events into Today, Upcoming, and Past.
 */
function groupEventsByTime(events: CalendarEvent[]) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const today: CalendarEvent[] = [];
    const upcoming: CalendarEvent[] = [];
    const past: CalendarEvent[] = [];

    for (const event of events) {
        const eventDate = new Date(event.start_time);
        if (eventDate >= todayStart && eventDate < todayEnd) {
            today.push(event);
        } else if (eventDate >= todayEnd) {
            upcoming.push(event);
        } else {
            past.push(event);
        }
    }

    return { today, upcoming, past };
}

export default async function CalendarPage() {
    const events = await getCalendarEvents();
    const { today, upcoming, past } = groupEventsByTime(events);

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        📅 Calendar
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {events.length} {events.length === 1 ? "event" : "events"}
                    </p>
                </div>
                <NewEventButton />
            </div>

            {events.length > 0 ? (
                <div className="space-y-8">
                    {/* Today */}
                    {today.length > 0 && (
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Today
                                <span className="text-[var(--color-text-muted)] font-normal">
                                    ({today.length})
                                </span>
                            </h2>
                            <div className="space-y-2">
                                {today.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming */}
                    {upcoming.length > 0 && (
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                Upcoming
                                <span className="text-[var(--color-text-muted)] font-normal">
                                    ({upcoming.length})
                                </span>
                            </h2>
                            <div className="space-y-2">
                                {upcoming.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Past */}
                    {past.length > 0 && (
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                                <span className="h-2 w-2 rounded-full bg-gray-500" />
                                Past
                                <span className="text-[var(--color-text-muted)] font-normal">
                                    ({past.length})
                                </span>
                            </h2>
                            <div className="space-y-2 opacity-60">
                                {past.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon="📅"
                    title="No events yet"
                    description="Create your first calendar event to start organizing your schedule."
                />
            )}
        </div>
    );
}
