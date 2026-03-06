// ─── Edit Note Page ──────────────────────────────────────
// Server Component — fetches note data and delegates to EditNoteClient.
//
// ARCHITECTURE:
// This page is a Server Component because it needs to call getNoteById(),
// which uses the server-only Supabase client (cookies-based auth).
// The actual editing UI lives in EditNoteClient (Client Component),
// which receives the fetched note as a prop.
//
// This pattern is the canonical Next.js App Router approach:
// Server Component (data) → Client Component (interactivity)

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/data/notes";
import EditNoteClient from "./EditNoteClient";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const note = await getNoteById(id);

    return {
        title: note ? `Edit: ${note.title ?? "Untitled"}` : "Edit Note",
    };
}

export default async function EditNotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const note = await getNoteById(id);

    if (!note) {
        notFound();
    }

    return <EditNoteClient note={note} />;
}
