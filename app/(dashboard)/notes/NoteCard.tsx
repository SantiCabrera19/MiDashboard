"use client";

// ─── NoteCard ───────────────────────────────────────────
// Client Component — interactive card for a single note.
//
// WHY Client Component?
// - Needs onClick handlers for edit, delete, pin actions
// - Manages its own modal states (edit form, delete confirm)
// - Uses useTransition for non-blocking Server Actions
//
// COMPONENT ARCHITECTURE:
// This component encapsulates ALL note interactions.
// The parent (page.tsx) just passes the Note data — it doesn't
// know about modals, forms, or Server Actions.

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { deleteNote, togglePin } from "@/lib/actions/notes";
import type { Note } from "@/lib/data/notes";
import NoteForm from "./NoteForm";

interface NoteCardProps {
    note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handlePin() {
        startTransition(async () => {
            await togglePin(note.id, note.pinned ?? false);
        });
    }

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteNote(note.id);
            if (result.success) {
                setShowDeleteConfirm(false);
            }
        });
    }

    return (
        <>
            <Card className={`group relative ${isPending ? "opacity-50" : ""}`}>
                {/* Click area — navigates to detail page */}
                <Link href={`/notes/${note.id}`} className="block">
                    {/* Header: title + badges */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                            {note.title ?? "Untitled"}
                        </h3>
                        <div className="flex gap-1.5 shrink-0">
                            {note.pinned && <Badge variant="info">📌</Badge>}
                            {note.is_markdown && <Badge>MD</Badge>}
                        </div>
                    </div>

                    {/* Content preview */}
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                        {note.content}
                    </p>

                    {/* Date */}
                    {note.updated_at && (
                        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                            Updated {new Date(note.updated_at).toLocaleDateString()}
                        </p>
                    )}
                </Link>

                {/* Action buttons — appear on hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handlePin}
                        disabled={isPending}
                        className="rounded-md p-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors"
                        title={note.pinned ? "Unpin" : "Pin"}
                    >
                        {note.pinned ? "📌" : "📍"}
                    </button>
                    <button
                        onClick={() => setShowEditForm(true)}
                        disabled={isPending}
                        className="rounded-md p-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="rounded-md p-1.5 text-xs hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </Card>

            {/* Edit Modal — reuses NoteForm in edit mode */}
            <NoteForm
                note={note}
                open={showEditForm}
                onClose={() => setShowEditForm(false)}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Delete Note
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Are you sure you want to delete &quot;{note.title ?? "Untitled"}&quot;?
                            This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                loading={isPending}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
