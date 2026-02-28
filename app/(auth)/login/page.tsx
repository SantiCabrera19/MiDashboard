// ─── Login Page ─────────────────────────────────────────
// Server Component — placeholder for the Login page.
// Route: /login (via (auth) route group)
//
// Phase 5 will add:
// - OAuth buttons (Google, GitHub) via Supabase Auth
// - Error handling for failed logins
// - Redirect to /notes after successful login

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginPage() {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Sign in to your account
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
                OAuth with Google and GitHub coming in Phase 5.
            </p>

            {/* Placeholder OAuth buttons */}
            <div className="space-y-3 pt-2">
                <button
                    className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-[var(--color-border)]
            bg-[var(--color-surface-2)] px-4 py-3
            text-sm font-medium text-[var(--color-text-primary)]
            transition-colors
            hover:bg-[var(--color-surface-3)]
          "
                    disabled
                >
                    🔵 Continue with Google
                </button>
                <button
                    className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-[var(--color-border)]
            bg-[var(--color-surface-2)] px-4 py-3
            text-sm font-medium text-[var(--color-text-primary)]
            transition-colors
            hover:bg-[var(--color-surface-3)]
          "
                    disabled
                >
                    ⚫ Continue with GitHub
                </button>
            </div>
        </div>
    );
}
