"use client";

// ─── EventCard ──────────────────────────────────────────
// Client Component — displays a single calendar event.
// Hover reveals edit and delete actions.

import { useState, useTransition } from "react";
import { Badge, Button, useToast } from "@/components/ui";
import { deleteEvent } from "@/lib/actions/calendar";
import EventForm from "./EventForm";
import type { CalendarEvent } from "@/lib/data/calendar";

interface EventCardProps {
    event: CalendarEvent;
}

function formatEventTime(event: CalendarEvent): string {
    const start = new Date(event.start_time);
    if (event.all_day) {
        return start.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
    }
    const timeStr = start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const dateStr = start.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    return `${dateStr} · ${timeStr}`;
}

function formatDuration(event: CalendarEvent): string | null {
    if (event.all_day || !event.end_time) return null;
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function EventCard({ event }: EventCardProps) {
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteEvent(event.id);
            if (result.success) {
                setShowDelete(false);
                toast.success("Event deleted");
            } else {
                toast.error("Failed to delete event");
            }
        });
    }

    const duration = formatDuration(event);

    return (
        <>
            <div
                className={`group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 transition-colors hover:bg-[var(--color-surface-2)] ${isPending ? "opacity-50" : ""
                    }`}
            >
                {/* Color indicator */}
                <div
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color ?? "var(--color-brand)" }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                        {event.title}
                    </h3>
                    {event.description && (
                        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)] line-clamp-1">
                            {event.description}
                        </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {formatEventTime(event)}
                        </span>
                        {duration && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                                ({duration})
                            </span>
                        )}
                        {event.all_day && <Badge variant="info">All day</Badge>}
                        {event.event_type && <Badge>{event.event_type}</Badge>}
                        {event.reminder_minutes && (
                            <Badge variant="warning">🔔 {event.reminder_minutes}min</Badge>
                        )}
                    </div>
                </div>

                {/* Actions — appear on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={() => setShowEdit(true)}
                        className="rounded-md p-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => setShowDelete(true)}
                        className="rounded-md p-1.5 text-xs hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <EventForm
                event={event}
                open={showEdit}
                onClose={() => setShowEdit(false)}
            />

            {/* Delete Confirmation */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDelete(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Delete Event
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Delete &quot;{event.title}&quot;? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowDelete(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDelete} loading={isPending}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
