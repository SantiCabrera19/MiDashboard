// ─── Videos Loading Skeleton ────────────────────────────
// Matches the shape of the videos page: header + channel pills + grid.

import { Skeleton } from "@/components/ui";

export default function VideosLoading() {
    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="mt-2 h-4 w-48" />
                </div>
            </div>

            {/* Channel pills */}
            <div className="mb-6 flex gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-28 rounded-full" />
                ))}
            </div>

            {/* Video grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]"
                    >
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="mt-1 h-4 w-3/4" />
                            <div className="mt-2 flex gap-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
