"use client";

// ─── Note Detail Actions ────────────────────────────────
// Client Component — action buttons for the note detail page.
//
// WHY separate from page.tsx?
// The detail page is a Server Component. Actions need onClick
// handlers, so they must be a Client Component. This thin wrapper
// handles edit, delete, and pin — keeping the page clean.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, useToast } from "@/components/ui";
import { deleteNote, togglePin } from "@/lib/actions/notes";
import type { Note } from "@/lib/data/notes";

interface NoteDetailActionsProps {
    note: Note;
}

export default function NoteDetailActions({ note }: NoteDetailActionsProps) {
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    function handlePin() {
        startTransition(async () => {
            await togglePin(note.id, note.pinned ?? false);
            toast.success(note.pinned ? "Note unpinned" : "Note pinned");
        });
    }

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteNote(note.id);
            if (result.success) {
                toast.success("Note deleted");
                router.push("/notes");
            } else {
                toast.error("Failed to delete note");
            }
        });
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePin}
                    disabled={isPending}
                >
                    {note.pinned ? "Unpin" : "📌 Pin"}
                </Button>
                <Link href={`/notes/${note.id}/edit`}>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={isPending}
                    >
                        ✏️ Edit
                    </Button>
                </Link>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isPending}
                >
                    🗑️ Delete
                </Button>
            </div>

            {/* Delete Confirmation */}
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
