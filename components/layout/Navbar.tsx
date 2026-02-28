// ─── Navbar ─────────────────────────────────────────────
// Server Component (no "use client") — this is purely static UI.
// It renders a top bar with a placeholder for breadcrumbs
// and user actions. No interactivity needed = no JS sent to browser.
//
// ARCHITECTURE NOTE:
// The Navbar lives inside (dashboard)/layout.tsx alongside the
// Sidebar. Since the layout persists across navigations, the
// Navbar also persists. The page title will be set dynamically
// via metadata, not here — this is just the visual bar.

export default function Navbar() {
    return (
        <header
            className="
        sticky top-0 z-30
        flex items-center justify-between
        border-b border-[var(--color-border)]
        bg-[var(--color-surface-0)]/80
        backdrop-blur-md
        px-6
      "
            style={{ height: "var(--navbar-height)" }}
        >
            {/* Left side — breadcrumb / search placeholder */}
            <div className="flex items-center gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Dashboard
                </p>
            </div>

            {/* Right side — actions placeholder (notifications, settings) */}
            <div className="flex items-center gap-2">
                <button
                    className="
            rounded-lg p-2
            text-[var(--color-text-secondary)]
            transition-colors
            hover:bg-[var(--color-surface-2)]
            hover:text-[var(--color-text-primary)]
          "
                    aria-label="Notifications"
                >
                    🔔
                </button>
                <button
                    className="
            rounded-lg p-2
            text-[var(--color-text-secondary)]
            transition-colors
            hover:bg-[var(--color-surface-2)]
            hover:text-[var(--color-text-primary)]
          "
                    aria-label="Settings"
                >
                    ⚙️
                </button>
            </div>
        </header>
    );
}
