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
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const allTags = [...new Set(notes.flatMap((note) => note.tags ?? []))];

    // Filter notes by title OR content (case-insensitive)
    const filteredNotes = notes.filter((note) => {
        const tagMatch = !activeTag || (note.tags ?? []).includes(activeTag);
        if (!tagMatch) return false;

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

            {allTags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                        const isActive = activeTag === tag;
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    isActive
                                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]"
                                        : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                                }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

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
                    description={`No results${
                        searchQuery ? ` for "${searchQuery}"` : ""
                    }${activeTag ? ` with tag "${activeTag}"` : ""}. Try different filters.`}
                />
            )}
        </div>
    );
}
