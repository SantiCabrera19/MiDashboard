// ─── Navbar ─────────────────────────────────────────────
// Server Component — async to fetch notification count.
// It renders a top bar with notification bell (with live badge)
// and settings link.
//
// ARCHITECTURE NOTE:
// The Navbar lives inside (dashboard)/layout.tsx alongside the
// Sidebar. Since the layout persists across navigations, the
// Navbar also persists. The page title will be set dynamically
// via metadata, not here — this is just the visual bar.

import Link from "next/link";
import { getNotifications } from "@/lib/data/notifications";

export default async function Navbar() {
    const notifications = await getNotifications();
    const count = notifications.length;

    return (
        <header
            className="
        sticky top-0 z-30
        flex items-center justify-between
        border-b border-[var(--color-border)]
        bg-[var(--color-surface-0)]/80
        backdrop-blur-md
        pl-16 pr-4 lg:px-6
      "
            style={{ height: "var(--navbar-height)" }}
        >
            {/* Left side — spacer reserved for future breadcrumbs */}
            <span />

            {/* Right side — actions */}
            <div className="flex items-center gap-2">
                {/* Notification bell with badge */}
                <Link
                    href="/notifications"
                    className="
            relative rounded-lg p-2
            text-[var(--color-text-secondary)]
            transition-colors
            hover:bg-[var(--color-surface-2)]
            hover:text-[var(--color-text-primary)]
          "
                    aria-label={`Notifications${count > 0 ? ` (${count})` : ""}`}
                >
                    🔔
                    {count > 0 && (
                        <span className="
              absolute top-1 right-1
              flex h-4 w-4 items-center justify-center
              rounded-full bg-[var(--color-error)]
              text-[10px] font-bold text-white
              leading-none
            ">
                            {count > 9 ? "9+" : count}
                        </span>
                    )}
                </Link>

                <Link
                    href="/settings"
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
                </Link>
            </div>
        </header>
    );
}
