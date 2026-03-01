// ─── Calendar Loading Skeleton ──────────────────────────
// Matches the shape of the calendar page.

import { Skeleton } from "@/components/ui";

export default function CalendarLoading() {
    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="mt-2 h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Section header */}
            <Skeleton className="mb-3 h-4 w-20" />

            {/* Event cards */}
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4"
                    >
                        <Skeleton className="mt-1 h-3 w-3 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="mt-1 h-4 w-60" />
                            <div className="mt-2 flex gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
