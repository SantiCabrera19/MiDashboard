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
        <div className="
            flex flex-col items-center justify-center py-20 px-6 text-center 
            rounded-2xl border-2 border-dashed border-[var(--color-border)] 
            bg-[var(--color-surface-1)]/30 
            transition-all duration-300
            hover:border-[var(--color-brand)]/30 hover:bg-[var(--color-surface-1)]/80
            group
        ">
            {/* Icon container with gradient background and subtle animation */}
            <div className="
                mb-6 flex h-20 w-20 items-center justify-center rounded-full 
                bg-gradient-to-tr from-[var(--color-brand)]/20 to-[var(--color-brand)]/5 
                ring-8 ring-[var(--color-surface-1)]/50 
                shadow-[0_0_30px_-5px_var(--color-brand-glow)]
                transition-transform duration-300 group-hover:scale-110
            ">
                <span className="text-4xl drop-shadow-sm">{icon}</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">
                {title}
            </h3>

            <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {description}
            </p>

            {/* Action with slight delay/fade-in if mounted */}
            {action && (
                <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
                    {action}
                </div>
            )}
        </div>
    );
}
