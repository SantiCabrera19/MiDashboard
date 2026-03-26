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
import { redirect } from "next/navigation";
import { getNoteById } from "@/lib/data/notes";
import { isHtmlContent, plainTextToHtml } from "@/lib/utils/note-content";
import { Badge, Button, Card } from "@/components/ui";

// Dynamic metadata — page title matches the note title
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    if (id === "new") {
        return { title: "New Note" };
    }

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
    if (id === "new") redirect("/notes");

    const note = await getNoteById(id);

    if (!note) redirect("/notes");

    return (
        <div className="mx-auto max-w-3xl">
            <Card className="mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                {note.title ?? "Untitled"}
                            </h1>
                            {note.pinned && <Badge variant="info">📌 Pinned</Badge>}
                            {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {note.tags.map((tag) => (
                                        <Badge key={tag} variant="default">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                            Updated{" "}
                            {note.updated_at
                                ? new Date(note.updated_at).toLocaleDateString("es-AR")
                                : "-"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <form action="/notes" method="get">
                            <Button variant="ghost" size="sm" type="submit">
                                ← Back
                            </Button>
                        </form>
                        <form action={`/notes/${note.id}/edit`} method="get">
                            <Button variant="secondary" size="sm" type="submit">
                                ✏️ Edit
                            </Button>
                        </form>
                    </div>
                </div>
            </Card>

            {/* Note content */}
            <Card>
                {isHtmlContent(note.content) ? (
                    <div
                        className="prose prose-invert max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                ) : (
                    <div
                        className="prose prose-invert max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: plainTextToHtml(note.content) }}
                    />
                )}
            </Card>
        </div>
    );
}
