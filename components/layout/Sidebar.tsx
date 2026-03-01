"use client";

// ─── Sidebar ────────────────────────────────────────────
// Client Component — navigation + user info.
//
// WHY "use client"?
// - NavItem uses usePathname() which is a Client hook
// - The sidebar needs to re-render when route changes
//   to update the active state highlight
//
// USER DATA:
// The user object is passed from the dashboard layout (Server Component).
// The Sidebar doesn't fetch user data itself — it receives it as a prop.
// This way, the parent controls the data source.

import NavItem from "./NavItem";
import SignOutButton from "./SignOutButton";

// Navigation configuration — centralized for easy modification.
const NAV_ITEMS = [
    { href: "/home", icon: "🏠", label: "Home" },
    { href: "/notes", icon: "📝", label: "Notes" },
    { href: "/finances", icon: "💰", label: "Finances" },
    { href: "/calendar", icon: "📅", label: "Calendar" },
    { href: "/videos", icon: "🎬", label: "Videos" },
] as const;

interface SidebarProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    } | null;
}

export default function Sidebar({ user }: SidebarProps) {
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

            {/* ── Footer — user info + sign out ── */}
            <div className="border-t border-[var(--color-border)] px-4 py-3">
                {user ? (
                    <div className="flex items-center gap-3">
                        {/* Avatar — uses Google profile picture if available */}
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-8 w-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                {user.name}
                            </p>
                            <SignOutButton />
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-[var(--color-text-muted)]">Not signed in</p>
                )}
            </div>
        </aside>
    );
}
