// ─── EmptyState ─────────────────────────────────────────
// Server Component — displayed when a list has no data.
//
// USE CASES:
// - No notes yet → "Create your first note"
// - No transactions this month → "No transactions recorded"
// - No YouTube channels followed → "Follow a channel"
//
// WHY a dedicated component?
// Every module needs an empty state. Without this, you'd copy-paste
// the same "no data" UI everywhere with slight variations.
// EmptyState centralizes the pattern: icon + title + description + action.
//
// The `action` prop accepts a ReactNode (usually a Button) so the
// parent controls what happens (navigate, open modal, etc.)

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    /** Optional action — usually a Button component */
    action?: React.ReactNode;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
                {description}
            </p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
