"use client";

// ─── Notes Page Header ─────────────────────────────────
// Client Component wrapper for the "New Note" button + modal.
//
// WHY separate component?
// The notes page.tsx is a Server Component (async, fetches data).
// Server Components can't have useState or onClick handlers.
// So we extract the interactive "New Note" button + modal into
// this small Client Component, and the page composes it.
//
// This is the pattern: Server Component renders data,
// Client Components handle interactivity. Minimal JS shipped.

import { useState } from "react";
import { Button } from "@/components/ui";
import NoteForm from "./NoteForm";

export default function NewNoteButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                + New Note
            </Button>
            <NoteForm open={open} onClose={() => setOpen(false)} />
        </>
    );
}
