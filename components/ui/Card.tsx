// ─── Card ───────────────────────────────────────────────
// Server Component — purely presentational container.
//
// DESIGN PHILOSOPHY:
// Card is intentionally "dumb" — it's just a styled container.
// It doesn't know about notes, transactions, or videos.
// The PARENT decides what goes inside via {children}.
//
// This is the Composition pattern from React:
//   <Card>
//     <h3>Any title</h3>
//     <p>Any content</p>
//   </Card>
//
// WHY not a NoteCard, FinanceCard, etc.?
// Because the visual container (border, bg, padding, hover) is ALWAYS
// the same. Only the CONTENT changes. DRY principle.

interface CardProps {
    children: React.ReactNode;
    className?: string;
    /** Makes the card interactive (hover effect + cursor pointer) */
    interactive?: boolean;
    /** Removes default padding — useful for cards with images/thumbnails */
    noPadding?: boolean;
}

export default function Card({
    children,
    className = "",
    interactive = false,
    noPadding = false,
}: CardProps) {
    return (
        <div
            className={`
        rounded-xl border border-[var(--color-border)]
        bg-[var(--color-surface-1)]
        transition-all duration-200 ease-out
        ${!noPadding ? "p-5" : ""}
        ${interactive
                    ? "cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                    : ""
                }
        ${className}
      `}
        >
            {children}
        </div>
    );
}
