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
import { ToastProvider } from "@/components/ui";
import { getUser } from "@/lib/actions/auth";
import { getUserProfile } from "@/lib/data/settings";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch user + profile in parallel — middleware guarantees a valid session
    const [user, profile] = await Promise.all([getUser(), getUserProfile()]);

    // Extract user info for the Sidebar
    // Priority: profile display_name → Google full_name → email prefix → "User"
    const sidebarUser = user
        ? {
            name:
                profile?.display_name ??
                user.user_metadata?.full_name ??
                user.email?.split("@")[0] ??
                "User",
            email: user.email ?? "",
            avatar:
                profile?.avatar_url ??
                user.user_metadata?.avatar_url,
        }
        : null;

    return (
        <ToastProvider>
            <div className="flex min-h-screen">
                {/* Sidebar — fixed position, receives user data */}
                <Sidebar user={sidebarUser} />

                {/* Main content area — full-width on mobile, offset on desktop */}
                <div className="flex flex-1 flex-col lg:ml-[var(--sidebar-width)] min-w-0">
                    {/* Navbar — sticky at top, persists across pages */}
                    <Navbar />

                    {/* Page content — THIS is what changes on navigation */}
                    <main className="flex-1 p-4 lg:p-6 min-w-0">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}
