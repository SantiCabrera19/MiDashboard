"use client";

// ─── NewEventButton ─────────────────────────────────────
// Thin Client Component wrapper — same pattern as Notes/Finances.

import { useState } from "react";
import { Button } from "@/components/ui";
import EventForm from "./EventForm";

export default function NewEventButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                + New Event
            </Button>
            <EventForm open={open} onClose={() => setOpen(false)} />
        </>
    );
}
