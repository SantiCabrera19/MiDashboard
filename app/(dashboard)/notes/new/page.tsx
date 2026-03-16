"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { Button, Input, useToast } from "@/components/ui";
import { createNote } from "@/lib/actions/notes";

export default function NewNotePage() {
    const router = useRouter();
    const toast = useToast();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
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
        // Note: For rich text we store HTML strings. We mark is_markdown=false
        // because TipTap naturally outputs HTML, and our NoteCard uses dangerouslySetInnerHTML
        // or a markdown parser if true. We'll pass it as is_markdown: false for now.
        const payload = {
            title,
            content,
            is_markdown: false,
        };

        const result = await createNote(payload);

        setIsSaving(false);

        if (result.success) {
            toast.success("Note created successfully");
            router.push("/notes");
        } else {
            toast.error(result.error ?? "Failed to create note");
        }
    }

    return (
        <div className="mx-auto max-w-4xl pb-12">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link
                        href="/notes"
                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-2 inline-block"
                    >
                        ← Back to Notes
                    </Link>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Create New Note
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/notes">
                        <Button variant="ghost">Cancel</Button>
                    </Link>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Note"}
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
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Content
                    </label>
                    <TipTapEditor onChange={setContent} />
                </div>
            </div>

            {/* Sticky bottom bar — mobile only (desktop uses top header buttons) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-1)]/95 backdrop-blur-sm px-4 py-3 lg:hidden">
                <Link href="/notes" className="flex-1">
                    <Button variant="ghost" className="w-full">Cancel</Button>
                </Link>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                >
                    {isSaving ? "Saving..." : "Save Note"}
                </Button>
            </div>

            {/* Bottom padding so content isn't hidden behind sticky bar — mobile only */}
            <div className="h-20 lg:hidden" />
        </div>
    );
}
