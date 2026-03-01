// ─── Home Loading Skeleton ──────────────────────────────
// Matches the dashboard home layout: header + 4 stat cards + content grid.

import { Skeleton } from "@/components/ui";

export default function HomeLoading() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-[var(--color-border)] pb-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-48" />
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="mt-3 h-8 w-20" />
                        <Skeleton className="mt-1 h-4 w-28" />
                    </div>
                ))}
            </div>

            {/* Content grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i}>
                        <Skeleton className="mb-3 h-4 w-32" />
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <Skeleton key={j} className="h-5 w-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Transactions */}
            <div>
                <Skeleton className="mb-3 h-4 w-40" />
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
