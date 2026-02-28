"use client";

// ─── NavItem ────────────────────────────────────────────
// Client Component because it needs usePathname() to detect
// if THIS link is the currently active route.
//
// WHY a separate component?
// - Keeps Sidebar cleaner (Single Responsibility Principle)
// - Only THIS small component ships JS to the browser
// - The rest of Sidebar could be Server if needed

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
}

export default function NavItem({ href, icon, label }: NavItemProps) {
    const pathname = usePathname();

    // Match exact path OR subpaths (e.g. /notes/abc still highlights "Notes")
    const isActive =
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 rounded-lg px-3 py-2.5
        text-sm font-medium transition-all duration-150
        ${isActive
                    ? "bg-[var(--color-brand)] text-white shadow-md shadow-indigo-500/20"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                }
      `}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
