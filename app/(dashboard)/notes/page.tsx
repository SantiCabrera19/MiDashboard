// ─── Notes Page ─────────────────────────────────────────
// Server Component — fetches REAL notes from Supabase.
// Route: /notes
//
// This is an async Server Component — it can await data directly.
// No useEffect, no loading state needed (loading.tsx handles that).
// The data function getNotes() handles the Supabase query internally,
// so this page doesn't know anything about Supabase.

import type { Metadata } from "next";
import { Card, Badge, Button, Input, EmptyState } from "@/components/ui";
import { getNotes } from "@/lib/data/notes";

export const metadata: Metadata = {
    title: "Notes",
    description: "Manage your personal notes with markdown support.",
};

export default async function NotesPage() {
    // Fetch real data from Supabase — fully typed as Note[]
    const notes = await getNotes();

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        📝 Notes
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {notes.length} {notes.length === 1 ? "note" : "notes"} total
                    </p>
                </div>
                <Button size="sm">+ New Note</Button>
            </div>

            {/* Search — will be functional in Phase 4 */}
            <div className="mb-6">
                <Input placeholder="Search notes..." />
            </div>

            {/* Conditional rendering: data or empty state */}
            {notes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                        <Card key={note.id} interactive>
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                                    {note.title ?? "Untitled"}
                                </h3>
                                <div className="flex gap-1.5 shrink-0">
                                    {note.pinned && <Badge variant="info">📌</Badge>}
                                    {note.is_markdown && <Badge>MD</Badge>}
                                </div>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                                {note.content}
                            </p>
                            {note.updated_at && (
                                <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                                    Updated {new Date(note.updated_at).toLocaleDateString()}
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="📝"
                    title="No notes yet"
                    description="Create your first note to get started."
                />
            )}
        </div>
    );
}
