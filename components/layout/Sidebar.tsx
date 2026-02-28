"use client";

// ─── Sidebar ────────────────────────────────────────────
// Client Component — wraps NavItem components that need usePathname().
//
// WHY "use client"?
// - NavItem uses usePathname() which is a Client hook
// - The sidebar as a whole needs to re-render when route changes
//   to update the active state highlight
//
// ARCHITECTURE NOTE:
// This Sidebar lives inside (dashboard)/layout.tsx which is a
// Server Component. The layout NEVER re-mounts when navigating
// between /notes, /finances, etc. — so the sidebar persists
// and maintains its state (e.g. collapsed/expanded) across
// page navigations. This is a key benefit of Next.js layouts.

import NavItem from "./NavItem";

// Navigation configuration — centralized for easy modification.
// When adding a new module, just add an entry here.
const NAV_ITEMS = [
    { href: "/notes", icon: "📝", label: "Notes" },
    { href: "/finances", icon: "💰", label: "Finances" },
    { href: "/calendar", icon: "📅", label: "Calendar" },
    { href: "/videos", icon: "🎬", label: "Videos" },
] as const;

export default function Sidebar() {
    return (
        <aside
            className="
        fixed left-0 top-0 z-40
        flex h-screen flex-col
        border-r border-[var(--color-border)]
        bg-[var(--color-surface-1)]
      "
            style={{ width: "var(--sidebar-width)" }}
        >
            {/* ── Brand / Logo ── */}
            <div className="flex h-[var(--navbar-height)] items-center gap-2.5 border-b border-[var(--color-border)] px-5">
                <span className="text-2xl">⚡</span>
                <h1 className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                    MeDashboard
                </h1>
            </div>

            {/* ── Navigation Links ── */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </nav>

            {/* ── Footer — user info placeholder (Phase 5: Auth) ── */}
            <div className="border-t border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--color-surface-3)]" />
                    <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Santiago
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Free plan
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
