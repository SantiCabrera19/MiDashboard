// ─── Button ─────────────────────────────────────────────
// Server Component — no "use client" needed.
//
// WHY Server Component?
// Buttons don't inherently need client-side JS. onClick handlers
// are provided by the PARENT (which would be a Client Component).
// Server Actions work with native <button type="submit"> in forms.
// This way, Button ships 0 JS when used in Server Components.
//
// DESIGN:
// - 4 variants: primary (CTA), secondary (neutral), danger (destructive), ghost (minimal)
// - 3 sizes: sm, md, lg
// - Loading state: disables + shows spinner (CSS animation, no JS)
// - Extends native button props for maximum flexibility

import type { ButtonHTMLAttributes } from "react";

// ─── Types ──────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

// ─── Variant Styles ─────────────────────────────────────
// Centralized map instead of nested ternaries = easy to add new variants
const VARIANT_STYLES: Record<ButtonVariant, string> = {
    primary:
        "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm shadow-indigo-500/25",
    secondary:
        "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)]",
    danger:
        "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
    ghost:
        "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-5 py-2.5 text-base rounded-lg gap-2.5",
};

// ─── Component ──────────────────────────────────────────
export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
            disabled={isDisabled}
            {...props}
        >
            {/* Spinner — CSS-only animation, no JS needed */}
            {loading && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}
