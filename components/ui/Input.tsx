// ─── Input ──────────────────────────────────────────────
// This component does NOT use "use client" — it's a presentation layer.
//
// WHY NOT Client Component?
// Input renders an <input> with styling, label, and error message.
// It doesn't use hooks internally. The PARENT component decides:
//   - Server Component: uncontrolled input in a <form> with Server Actions
//   - Client Component: controlled input with value + onChange
//
// This flexibility means Input works in BOTH contexts without
// shipping unnecessary JS. The interactivity comes from the PARENT.
//
// USAGE:
//   <Input label="Title" placeholder="Enter note title..." />
//   <Input label="Amount" type="number" error="Required field" />

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Label text displayed above the input */
    label?: string;
    /** Error message displayed below the input (red) */
    error?: string;
    /** Helper text displayed below the input (muted) */
    helperText?: string;
}

export default function Input({
    label,
    error,
    helperText,
    id,
    className = "",
    ...props
}: InputProps) {
    // Generate a stable ID for label-input association (accessibility)
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    return (
        <div className="space-y-1.5">
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--color-text-primary)]"
                >
                    {label}
                </label>
            )}

            {/* Input field */}
            <input
                id={inputId}
                className={`
          w-full rounded-lg border px-3 py-2
          text-sm text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-muted)]
          bg-[var(--color-surface-2)]
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-[var(--color-brand)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
                        ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }
          ${className}
        `}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />

            {/* Error or helper text */}
            {error && (
                <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p className="text-xs text-[var(--color-text-muted)]">
                    {helperText}
                </p>
            )}
        </div>
    );
}
