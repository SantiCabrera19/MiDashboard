"use client";

// ─── NoteForm ───────────────────────────────────────────
// Client Component — reusable form for creating AND editing notes.
//
// WHY Client Component?
// - Needs useState for form fields
// - Needs useTransition for pending state during Server Action
// - Manages Modal open/close state
//
// REUSABILITY:
// - No `note` prop → create mode (empty fields)
// - With `note` prop → edit mode (pre-filled fields)
// - Same component, same form, different data
//
// PERFORMANCE:
// - useTransition marks the Server Action as non-blocking
// - The UI stays responsive while the action runs
// - After action completes, revalidatePath refreshes the list

import { useState, useTransition } from "react";
import { Modal, Input, Button } from "@/components/ui";
import { createNote, updateNote } from "@/lib/actions/notes";
import type { Note } from "@/lib/data/notes";

interface NoteFormProps {
    /** If provided, form enters edit mode with pre-filled data */
    note?: Note;
    /** Controls modal visibility */
    open: boolean;
    /** Called when modal should close */
    onClose: () => void;
}

export default function NoteForm({ note, open, onClose }: NoteFormProps) {
    const isEditing = !!note;

    // Form state — initialized from note (edit) or empty (create)
    const [title, setTitle] = useState(note?.title ?? "");
    const [content, setContent] = useState(note?.content ?? "");
    const [isMarkdown, setIsMarkdown] = useState(note?.is_markdown ?? false);
    const [error, setError] = useState<string | null>(null);

    // useTransition: keeps the UI responsive during Server Action execution
    // isPending = true while the action is running → show loading state
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validate
        if (!content.trim()) {
            setError("Content is required");
            return;
        }

        startTransition(async () => {
            const result = isEditing
                ? await updateNote(note.id, { title, content, is_markdown: isMarkdown })
                : await createNote({ title, content, is_markdown: isMarkdown });

            if (result.success) {
                // Reset form and close modal
                if (!isEditing) {
                    setTitle("");
                    setContent("");
                    setIsMarkdown(false);
                }
                onClose();
            } else {
                setError(result.error ?? "Something went wrong");
            }
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Note" : "Create Note"}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <Input
                    label="Title"
                    placeholder="Note title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Content */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="note-content"
                        className="block text-sm font-medium text-[var(--color-text-primary)]"
                    >
                        Content *
                    </label>
                    <textarea
                        id="note-content"
                        placeholder="Write your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="
              w-full rounded-lg border px-3 py-2
              text-sm text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-muted)]
              bg-[var(--color-surface-2)]
              border-[var(--color-border)]
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-[var(--color-brand)]
              hover:border-[var(--color-border-hover)]
              resize-y
            "
                        required
                    />
                </div>

                {/* Markdown toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isMarkdown}
                        onChange={(e) => setIsMarkdown(e.target.checked)}
                        className="rounded border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-brand)]"
                    />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        Markdown content
                    </span>
                </label>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                        {isEditing ? "Save Changes" : "Create Note"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
