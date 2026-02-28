// ─── Videos Page ────────────────────────────────────────
// Server Component — YouTube module.
// Route: /videos
//
// NO MOCK DATA. Shows EmptyState until Supabase is connected.

import type { Metadata } from "next";
import { Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
    title: "Videos",
    description: "Track YouTube channels and latest video uploads.",
};

export default function VideosPage() {
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        🎬 Videos
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        YouTube channels you follow and their latest uploads
                    </p>
                </div>
                <Button size="sm" variant="secondary">+ Follow Channel</Button>
            </div>

            {/* Empty state */}
            <EmptyState
                icon="🎬"
                title="No videos yet"
                description="Your YouTube subscriptions from Supabase will appear here once connected."
            />
        </div>
    );
}
