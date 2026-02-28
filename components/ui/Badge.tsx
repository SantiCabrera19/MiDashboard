// ─── Badge ──────────────────────────────────────────────
// Server Component — small visual label for status/categories.
//
// USE CASES:
// - Note pinned status: <Badge variant="info">📌 Pinned</Badge>
// - Transaction category: <Badge variant="success">Income</Badge>
// - Debt status: <Badge variant="warning">Active</Badge>
// - Error indicator: <Badge variant="error">Overdue</Badge>
//
// WHY Server Component?
// Badges are purely visual — no state, no events.
// The variant determines the color, children is the text.

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
    default:
        "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]",
    success:
        "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    warning:
        "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    error:
        "bg-red-500/15 text-red-400 border-red-500/20",
    info:
        "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1
        rounded-full border border-transparent
        px-2.5 py-0.5
        text-xs font-medium
        ${VARIANT_STYLES[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
