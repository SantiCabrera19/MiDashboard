"use client";

// ─── SignOutButton ──────────────────────────────────────
// Client Component — thin wrapper for the sign-out server action.
// Used in the Sidebar footer.

import { useTransition } from "react";
import { signOut } from "@/lib/actions/auth";

export default function SignOutButton() {
    const [isPending, startTransition] = useTransition();

    function handleSignOut() {
        startTransition(async () => {
            await signOut();
        });
    }

    return (
        <button
            onClick={handleSignOut}
            disabled={isPending}
            className="text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
        >
            {isPending ? "Signing out..." : "Sign out"}
        </button>
    );
}
