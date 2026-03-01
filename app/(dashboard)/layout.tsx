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
// AUTH INTEGRATION:
// The layout fetches the current user from Supabase and passes
// it to the Sidebar. This happens on the server — no client-side
// fetch. The middleware ensures the user is always authenticated
// when this layout renders.

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getUser } from "@/lib/actions/auth";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch user on the server — middleware guarantees a valid session
    const user = await getUser();

    // Extract user info for the Sidebar
    const sidebarUser = user
        ? {
            name:
                user.user_metadata?.full_name ??
                user.email?.split("@")[0] ??
                "User",
            email: user.email ?? "",
            avatar: user.user_metadata?.avatar_url,
        }
        : null;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar — fixed position, receives user data */}
            <Sidebar user={sidebarUser} />

            {/* Main content area — offset by sidebar width */}
            <div
                className="flex flex-1 flex-col"
                style={{ marginLeft: "var(--sidebar-width)" }}
            >
                {/* Navbar — sticky at top, persists across pages */}
                <Navbar />

                {/* Page content — THIS is what changes on navigation */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
