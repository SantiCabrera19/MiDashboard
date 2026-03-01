// ─── Finances Loading Skeleton ───────────────────────────
// Matches the shape of the finances page: summary cards + transaction list.

import { Skeleton } from "@/components/ui";

export default function FinancesLoading() {
    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="mt-2 h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5"
                    >
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-3 h-8 w-28" />
                    </div>
                ))}
            </div>

            {/* Transactions list */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
                <Skeleton className="mb-4 h-4 w-40" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3">
                            <div>
                                <Skeleton className="h-4 w-48" />
                                <div className="mt-1.5 flex gap-2">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
