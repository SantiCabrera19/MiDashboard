// ─── Notes Page ─────────────────────────────────────────
// Server Component — Notes module.
// Route: /notes
//
// NO MOCK DATA. Shows EmptyState until Supabase is connected (Phase 3).
// The design system components (Card, Badge, Button) are ready to use
// when real data flows in.

import type { Metadata } from "next";
import { Button, EmptyState, Input } from "@/components/ui";

export const metadata: Metadata = {
    title: "Notes",
    description: "Manage your personal notes with markdown support.",
};

export default function NotesPage() {
    return (
        <div>
            {/* Page header with actions */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        📝 Notes
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Your personal notes with markdown support
                    </p>
                </div>
                <Button size="sm">+ New Note</Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input placeholder="Search notes..." />
            </div>

            {/* Empty state — will be replaced with real data in Phase 3 */}
            <EmptyState
                icon="📝"
                title="No notes yet"
                description="Your notes from Supabase will appear here once connected."
            />
        </div>
    );
}
