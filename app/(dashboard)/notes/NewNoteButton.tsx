"use client";

// ─── Notes Page Header ─────────────────────────────────
// Client Component wrapper for the "New Note" button.
// Uses a Link to navigate to the dedicated new note page.

import Link from "next/link";
import { Button } from "@/components/ui";

export default function NewNoteButton() {
    return (
        <Link href="/notes/new">
            <Button size="sm">
                + New Note
            </Button>
        </Link>
    );
}
