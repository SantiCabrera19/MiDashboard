// ─── Dashboard Layout ───────────────────────────────────
// Server Component — wraps ALL dashboard pages (/notes, /finances, etc.)
//
// ARCHITECTURE:
// This layout renders the Sidebar and Navbar once, and they
// PERSIST across page navigations. When the user clicks
// from /notes to /finances, only the {children} (= page.tsx)
// re-renders. The sidebar and navbar keep their state and
// NEVER re-mount. This is the key benefit of Next.js layouts.
//
// HIERARCHY:
// app/layout.tsx (Root: <html>, <body>, fonts)
//   └── app/(dashboard)/layout.tsx (THIS: sidebar + navbar)
//         └── app/(dashboard)/notes/page.tsx (page content)
//
// NOTE: "(dashboard)" in the folder name is a Route Group —
// it does NOT appear in the URL. The user sees /notes, not /dashboard/notes.

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar — fixed position, always visible */}
            <Sidebar />

            {/* Main content area — offset by sidebar width */}
            <div
                className="flex flex-1 flex-col"
                style={{ marginLeft: "var(--sidebar-width)" }}
            >
                {/* Navbar — sticky at top, persists across pages */}
                <Navbar />

                {/* Page content — THIS is what changes on navigation */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
