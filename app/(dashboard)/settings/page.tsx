// ─── Settings Page ──────────────────────────────────────
// Server Component — fetches user data and preferences,
// then passes them as props to Client section components.
//
// WHY Server Component?
// - Data fetching happens on the server (no loading state needed)
// - Client Components only receive the data they need
// - Page can be statically optimized after first render

import type { Metadata } from "next";
import { getUser } from "@/lib/actions/auth";
import { getUserProfile, getUserPreferences } from "@/lib/data/settings";
import { getGoogleCalendarStatus } from "@/lib/actions/google-calendar";
import ProfileSection from "./ProfileSection";
import WidgetVisibilitySection from "./WidgetVisibilitySection";
import NotificationPrefsSection from "./NotificationPrefsSection";
import GoogleCalendarSection from "./GoogleCalendarSection";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your profile, dashboard preferences, and notification settings.",
};

export default async function SettingsPage() {
    // Parallel fetch — user, profile, preferences, and Google Calendar status
    const [user, profile, preferences, googleCalendarStatus] = await Promise.all([
        getUser(),
        getUserProfile(),
        getUserPreferences(),
        getGoogleCalendarStatus(),
    ]);

    // Extract Google OAuth metadata (fallbacks)
    const googleName: string | null = user?.user_metadata?.full_name ?? null;
    const googleAvatar: string | null = user?.user_metadata?.avatar_url ?? null;
    const email: string = user?.email ?? "";

    return (
        <div className="mx-auto max-w-2xl space-y-10">
            {/* ── Page Header ── */}
            <div className="border-b border-[var(--color-border)] pb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ⚙️ Settings
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Manage your profile, dashboard layout, and notification preferences.
                </p>
            </div>

            {/* ── Section 1: Profile ── */}
            <ProfileSection
                currentDisplayName={profile?.display_name ?? null}
                currentAvatarUrl={profile?.avatar_url ?? null}
                googleAvatarUrl={googleAvatar}
                googleName={googleName}
                email={email}
                userId={user?.id ?? ""}
            />

            {/* ── Section 2: Widget Visibility ── */}
            {preferences && (
                <WidgetVisibilitySection
                    statCards={preferences.visible_stat_cards}
                    sections={preferences.visible_sections}
                />
            )}

            {/* ── Section 3: Notification Preferences ── */}
            {preferences && (
                <NotificationPrefsSection
                    prefs={preferences.notification_prefs}
                />
            )}

            {/* ── Section 4: Google Calendar ── */}
            <GoogleCalendarSection status={googleCalendarStatus} />
        </div>
    );
}
