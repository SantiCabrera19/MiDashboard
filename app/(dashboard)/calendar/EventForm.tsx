"use client";

// ─── EventForm ──────────────────────────────────────────
// Client Component — reusable form for creating AND editing events.
//
// Features:
// - All-day toggle (hides time inputs when active)
// - Color picker from preset palette
// - Event type selector
// - Reminder minutes input

import { useState, useTransition } from "react";
import { Modal, Input, Button, useToast } from "@/components/ui";
import { createEvent, updateEvent } from "@/lib/actions/calendar";
import type { CalendarEvent } from "@/lib/data/calendar";

interface EventFormProps {
    event?: CalendarEvent;
    open: boolean;
    onClose: () => void;
}

const EVENT_TYPES = [
    { value: "meeting", label: "🤝 Meeting" },
    { value: "reminder", label: "🔔 Reminder" },
    { value: "deadline", label: "⏰ Deadline" },
    { value: "personal", label: "👤 Personal" },
    { value: "work", label: "💼 Work" },
    { value: "health", label: "❤️ Health" },
] as const;

const COLOR_PALETTE = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
] as const;

/**
 * Extract date and time parts from an ISO datetime string.
 */
function parseDatetime(iso: string | null | undefined) {
    if (!iso) return { date: new Date().toISOString().split("T")[0], time: "09:00" };
    const d = new Date(iso);
    return {
        date: d.toISOString().split("T")[0],
        time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    };
}

export default function EventForm({ event, open, onClose }: EventFormProps) {
    const isEditing = !!event;
    const toast = useToast();

    const startParts = parseDatetime(event?.start_time);
    const endParts = parseDatetime(event?.end_time);

    const [title, setTitle] = useState(event?.title ?? "");
    const [description, setDescription] = useState(event?.description ?? "");
    const [startDate, setStartDate] = useState(startParts.date);
    const [startTime, setStartTime] = useState(startParts.time);
    const [endDate, setEndDate] = useState(endParts.date);
    const [endTime, setEndTime] = useState(endParts.time);
    const [allDay, setAllDay] = useState(event?.all_day ?? false);
    const [eventType, setEventType] = useState(event?.event_type ?? "");
    const [color, setColor] = useState(event?.color ?? "");
    const [reminderMinutes, setReminderMinutes] = useState(
        event?.reminder_minutes?.toString() ?? ""
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        // Build ISO datetime strings
        const startIso = allDay
            ? `${startDate}T00:00:00`
            : `${startDate}T${startTime}:00`;
        const endIso = allDay
            ? `${endDate}T23:59:59`
            : `${endDate}T${endTime}:00`;

        startTransition(async () => {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                start_time: startIso,
                end_time: endIso,
                all_day: allDay,
                event_type: eventType || null,
                color: color || null,
                reminder_minutes: reminderMinutes ? parseInt(reminderMinutes, 10) : null,
            };

            const result = isEditing
                ? await updateEvent(event.id, payload)
                : await createEvent(payload);

            if (result.success) {
                if (!isEditing) {
                    setTitle("");
                    setDescription("");
                    setStartDate(new Date().toISOString().split("T")[0]);
                    setStartTime("09:00");
                    setEndDate(new Date().toISOString().split("T")[0]);
                    setEndTime("10:00");
                    setAllDay(false);
                    setEventType("");
                    setColor("");
                    setReminderMinutes("");
                }
                onClose();
                toast.success(isEditing ? "Event updated" : "Event created");
            } else {
                setError(result.error ?? "Something went wrong");
                toast.error(result.error ?? "Failed to save event");
            }
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Event" : "New Event"}
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <Input
                    label="Title *"
                    placeholder="Event name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Event details..."
                        rows={2}
                        className="
              w-full rounded-lg border px-3 py-2 resize-none
              text-sm text-[var(--color-text-primary)]
              bg-[var(--color-surface-2)]
              border-[var(--color-border)]
              placeholder:text-[var(--color-text-muted)]
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50
              hover:border-[var(--color-border-hover)]
            "
                    />
                </div>

                {/* All-day toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={allDay}
                        onChange={(e) => setAllDay(e.target.checked)}
                        className="rounded border-[var(--color-border)] bg-[var(--color-surface-2)]"
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">All day event</span>
                </label>

                {/* Start date/time */}
                <div className={`grid gap-3 ${allDay ? "grid-cols-1" : "grid-cols-2"}`}>
                    <Input
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    {!allDay && (
                        <Input
                            label="Start Time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    )}
                </div>

                {/* End date/time */}
                <div className={`grid gap-3 ${allDay ? "grid-cols-1" : "grid-cols-2"}`}>
                    <Input
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    {!allDay && (
                        <Input
                            label="End Time"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    )}
                </div>

                {/* Event type + Reminder — side by side */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                            Event Type
                        </label>
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="
                w-full rounded-lg border px-3 py-2
                text-sm text-[var(--color-text-primary)]
                bg-[var(--color-surface-2)]
                border-[var(--color-border)]
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50
                hover:border-[var(--color-border-hover)]
              "
                        >
                            <option value="">No type</option>
                            {EVENT_TYPES.map((et) => (
                                <option key={et.value} value={et.value}>
                                    {et.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Reminder (min)"
                        type="number"
                        min="0"
                        placeholder="15"
                        value={reminderMinutes}
                        onChange={(e) => setReminderMinutes(e.target.value)}
                    />
                </div>

                {/* Color picker */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                        Color
                    </label>
                    <div className="flex gap-2">
                        {COLOR_PALETTE.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(color === c ? "" : c)}
                                className={`h-7 w-7 rounded-full transition-all ${color === c
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface-1)] scale-110"
                                    : "hover:scale-110"
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                        {isEditing ? "Save Changes" : "Create Event"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
