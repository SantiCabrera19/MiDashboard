// ─── Note Detail Page ───────────────────────────────────
// Server Component — full view of a single note.
// Route: /notes/:id (dynamic route)
//
// CONCEPTS:
// - Dynamic route [id] → receives params.id from URL
// - generateMetadata() → dynamic title based on note data
// - notFound() → shows 404 if note doesn't exist
// - Server Component → can await data directly
// - NoteActions → Client Component for edit/delete/pin actions

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/data/notes";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";
import NoteDetailActions from "./NoteDetailActions";

// Dynamic metadata — page title matches the note title
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const note = await getNoteById(id);

    return {
        title: note?.title ?? "Note",
        description: note?.content?.slice(0, 160) ?? "View note details",
    };
}

export default async function NoteDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const note = await getNoteById(id);

    // If note not found → Next.js shows the nearest not-found.tsx or 404
    if (!note) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-3xl">
            {/* Back link */}
            <Link
                href="/notes"
                className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
                ← Back to Notes
            </Link>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {note.title ?? "Untitled"}
                        </h1>
                        {note.pinned && <Badge variant="info">📌 Pinned</Badge>}
                        {note.is_markdown && <Badge>Markdown</Badge>}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                        {note.created_at && (
                            <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
                        )}
                        {note.updated_at && (
                            <span>• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>

                {/* Actions — Client Component for interactivity */}
                <NoteDetailActions note={note} />
            </div>

            {/* Note content */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
                <div className="whitespace-pre-wrap text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {note.content}
                </div>
            </div>
        </div>
    );
}
