"use client";

// ─── NoteListClient ─────────────────────────────────────
// Client Component wrapper for the notes grid.
// Adds real-time search filtering on the client side.
// Receives the initial server-fetched notes as a prop.

import { useState } from "react";
import { Input, EmptyState } from "@/components/ui";
import NoteCard from "./NoteCard";
import type { Note } from "@/lib/data/notes";

interface NoteListClientProps {
    notes: Note[];
}

export default function NoteListClient({ notes }: NoteListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter notes by title OR content (case-insensitive)
    const filteredNotes = notes.filter((note) => {
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(q) ?? false;
        const contentMatch = note.content?.toLowerCase().includes(q) ?? false;

        return titleMatch || contentMatch;
    });

    return (
        <div>
            {/* Search Input */}
            <div className="mb-6">
                <Input
                    placeholder="Search notes by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Results */}
            {filteredNotes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="🔍"
                    title="No notes found"
                    description={`No results for "${searchQuery}". Try a different search term.`}
                />
            )}
        </div>
    );
}
