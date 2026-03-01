// ─── Notes Page ─────────────────────────────────────────
// Server Component — fetches REAL notes from Supabase.
// Route: /notes
//
// ARCHITECTURE:
// - This page is a Server Component → can await data directly
// - NoteCard is a Client Component → handles edit/delete/pin
// - NewNoteButton is a Client Component → handles create modal
// - Server fetches data, Client handles interactivity
// - Zero unnecessary re-renders: only NoteCard re-renders on action

import type { Metadata } from "next";
import { Input, EmptyState } from "@/components/ui";
import { getNotes } from "@/lib/data/notes";
import NoteCard from "./NoteCard";
import NewNoteButton from "./NewNoteButton";

export const metadata: Metadata = {
    title: "Notes",
    description: "Manage your personal notes with markdown support.",
};

export default async function NotesPage() {
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
                <NewNoteButton />
            </div>

            {/* Search — will be functional later */}
            <div className="mb-6">
                <Input placeholder="Search notes..." />
            </div>

            {/* Notes grid or empty state */}
            {notes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                        <NoteCard key={note.id} note={note} />
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
