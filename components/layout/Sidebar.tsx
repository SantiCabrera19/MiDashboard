"use client";

// ─── Sidebar ────────────────────────────────────────────
// Client Component — navigation + user info.
// Responsive: fixed on desktop, overlay on mobile.
//
// WHY "use client"?
// - NavItem uses usePathname() which is a Client hook
// - The sidebar needs to re-render when route changes
// - Mobile toggle state

import { useState } from "react";
import Image from "next/image";
import NavItem from "./NavItem";
import SignOutButton from "./SignOutButton";

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
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile overlay backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Hamburger toggle — mobile only */}
            <button
                onClick={() => setMobileOpen((v) => !v)}
                className="
          fixed left-4 top-4 z-50
          flex h-10 w-10 items-center justify-center
          rounded-lg border border-[var(--color-border)]
          bg-[var(--color-surface-1)]
          text-[var(--color-text-primary)]
          lg:hidden
          transition-colors hover:bg-[var(--color-surface-2)]
        "
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
                {mobileOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 z-40
          flex h-screen flex-col
          border-r border-[var(--color-border)]
          bg-[var(--color-surface-1)]
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
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
                            onClick={() => setMobileOpen(false)}
                        />
                    ))}
                </nav>

                {/* ── Footer — user info + sign out ── */}
                <div className="border-t border-[var(--color-border)] px-4 py-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                    <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                        referrerPolicy="no-referrer"
                                        sizes="32px"
                                    />
                                </div>
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
        </>
    );
}
