// ─── Skeleton ───────────────────────────────────────────
// Server Component — animated loading placeholder.
//
// DESIGN PHILOSOPHY:
// Skeleton is a building BLOCK, not a complete loading UI.
// You compose multiple Skeletons to match the shape of your content:
//
//   <Skeleton className="h-6 w-48" />       ← title
//   <Skeleton className="h-4 w-full" />     ← text line
//   <Skeleton className="h-32 w-full" />    ← card
//   <Skeleton className="h-10 w-10 rounded-full" /> ← avatar
//
// This is used inside loading.tsx files for each route.
// The goal: skeletons should MATCH the shape of the real content
// so there's no layout shift (CLS) when data arrives.

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-[var(--color-surface-3)] ${className}`}
            aria-hidden="true"
        />
    );
}
