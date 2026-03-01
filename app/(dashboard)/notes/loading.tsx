// ─── Notes Loading Skeleton ─────────────────────────────
// Shown automatically by Next.js while the notes page is loading.
//
// WHY loading.tsx?
// Next.js wraps the page in <Suspense> and shows this component
// while the async Server Component awaits data from Supabase.
// This prevents the user from seeing a blank page during fetch.
//
// The skeleton MATCHES the shape of the real page (header + grid)
// to prevent layout shift (CLS) when data arrives.

import { Skeleton } from "@/components/ui";

export default function NotesLoading() {
    return (
        <div>
            {/* Header skeleton */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="mt-2 h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Search skeleton */}
            <div className="mb-6">
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Grid skeleton — matches the 3-column card layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5"
                    >
                        <div className="mb-3 flex justify-between">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-10" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="mt-3 h-3 w-32" />
                    </div>
                ))}
            </div>
        </div>
    );
}
