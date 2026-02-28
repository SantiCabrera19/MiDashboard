// ─── Calendar Page ──────────────────────────────────────
// Server Component — Calendar module.
// Route: /calendar
//
// NO MOCK DATA. Shows EmptyState until Supabase is connected.

import type { Metadata } from "next";
import { Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
    title: "Calendar",
    description: "Manage events, reminders, and sync with Google Calendar.",
};

export default function CalendarPage() {
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        📅 Calendar
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Events, reminders, and Google Calendar sync
                    </p>
                </div>
                <Button size="sm">+ New Event</Button>
            </div>

            {/* Empty state */}
            <EmptyState
                icon="📅"
                title="No events yet"
                description="Your calendar events from Supabase will appear here once connected."
            />
        </div>
    );
}
