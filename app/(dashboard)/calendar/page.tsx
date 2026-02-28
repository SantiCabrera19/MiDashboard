// ─── Calendar Page ──────────────────────────────────────
// Server Component — fetches REAL calendar events from Supabase.
// Route: /calendar

import type { Metadata } from "next";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { getCalendarEvents } from "@/lib/data/calendar";

export const metadata: Metadata = {
    title: "Calendar",
    description: "Manage events, reminders, and sync with Google Calendar.",
};

export default async function CalendarPage() {
    const events = await getCalendarEvents();

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
                <Button size="sm">+ New Event</Button>
            </div>

            {/* Events list */}
            {events.length > 0 ? (
                <div className="space-y-3">
                    {events.map((event) => (
                        <Card key={event.id} interactive>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                                        {event.title}
                                    </h3>
                                    {event.description && (
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {new Date(event.start_time).toLocaleString()}
                                        </span>
                                        {event.all_day && <Badge variant="info">All day</Badge>}
                                        {event.synced_with_google && <Badge variant="success">Google</Badge>}
                                    </div>
                                </div>
                                {event.color && (
                                    <div
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: event.color }}
                                    />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="📅"
                    title="No events yet"
                    description="Create your first calendar event or sync with Google Calendar."
                />
            )}
        </div>
    );
}
