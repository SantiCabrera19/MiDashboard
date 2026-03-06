"use client";

// ─── Edit Note Client ────────────────────────────────────
// Client Component — handles the interactive editing experience.
//
// WHY separate from page.tsx?
// page.tsx is a Server Component that fetches the note data.
// This component receives the note as a prop and handles all
// client-side logic: TipTap editor, form state, save action.
//
// Server Actions (updateNote) can be called from Client Components —
// they execute on the server regardless of where they're invoked.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { Button, Input, useToast } from "@/components/ui";
import { updateNote } from "@/lib/actions/notes";
import type { Note } from "@/lib/data/notes";

interface EditNoteClientProps {
    note: Note;
}

export default function EditNoteClient({ note }: EditNoteClientProps) {
    const router = useRouter();
    const toast = useToast();

    const [title, setTitle] = useState(note.title ?? "");
    const [content, setContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!content.trim() || content === "<p></p>") {
            toast.error("Content is required");
            return;
        }

        setIsSaving(true);
        const payload = {
            title,
            content,
            is_markdown: false,
        };

        const result = await updateNote(note.id, payload);

        setIsSaving(false);

        if (result.success) {
            toast.success("Note updated successfully");
            router.push(`/notes/${note.id}`);
        } else {
            toast.error(result.error ?? "Failed to update note");
        }
    }

    return (
        <div className="mx-auto max-w-4xl pb-12">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link
                        href={`/notes/${note.id}`}
                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-2 inline-block"
                    >
                        ← Back to Note
                    </Link>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Edit Note
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link href={`/notes/${note.id}`}>
                        <Button variant="ghost">Cancel</Button>
                    </Link>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Title
                    </label>
                    <Input
                        id="title"
                        placeholder="e.g. Project Ideas, Weekly Meeting..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Content
                    </label>
                    <TipTapEditor initialContent={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
