// ─── Auth Layout ────────────────────────────────────────
// Server Component — wraps ALL auth pages (/login, /register).
//
// WHY a separate layout?
// - Auth pages should NOT show the sidebar or navbar
// - They need a centered, clean design (just a card in the middle)
// - Route Group "(auth)" makes the URL clean: /login, not /auth/login
//
// HIERARCHY:
// app/layout.tsx (Root: <html>, <body>, fonts)
//   └── app/(auth)/layout.tsx (THIS: centered card)
//         └── app/(auth)/login/page.tsx

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-0)] p-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <span className="text-4xl">⚡</span>
                    <h1 className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
                        MeDashboard
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Your personal command center
                    </p>
                </div>

                {/* Auth card — login/register content goes here */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-xl shadow-black/20">
                    {children}
                </div>
            </div>
        </div>
    );
}
