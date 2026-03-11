"use client";

// ─── Notification Preferences Section ───────────────────
// Client Component — toggles for notification types.
//
// NOTE: This is configuration only — no notification system exists yet.
// These preferences will be used when notifications are implemented.

import { useState } from "react";
import { Card } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { updatePreferences } from "@/lib/actions/settings";
import type { NotificationPrefs } from "@/lib/data/settings";

interface NotificationPrefsSectionProps {
    prefs: NotificationPrefs;
}

const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; label: string; icon: string; description: string }[] = [
    {
        key: "calendar_events",
        label: "Calendar Events",
        icon: "📅",
        description: "Get notified about upcoming events and reminders",
    },
    {
        key: "new_videos",
        label: "New Videos",
        icon: "🎬",
        description: "Get notified when followed channels upload new videos",
    },
    {
        key: "finances",
        label: "Finances",
        icon: "💰",
        description: "Get notified about budget alerts and payment reminders",
    },
    {
        key: "notes_reminders",
        label: "Notes Reminders",
        icon: "📝",
        description: "Get notified about pinned notes and reminder dates",
    },
];

export default function NotificationPrefsSection({
    prefs: initialPrefs,
}: NotificationPrefsSectionProps) {
    const toast = useToast();
    const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
    const [saving, setSaving] = useState(false);

    async function togglePref(key: keyof NotificationPrefs) {
        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);

        setSaving(true);
        const result = await updatePreferences({ notification_prefs: updated });
        setSaving(false);

        if (!result.success) {
            toast.error(result.error ?? "Failed to save notification preferences");
        }
    }

    return (
        <section>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
                🔔 Notification Preferences
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Choose which types of notifications you want to receive.
                These will take effect once the notification system is implemented.
            </p>

            <Card>
                <div className="space-y-1">
                    {NOTIFICATION_OPTIONS.map((option) => (
                        <label
                            key={option.key}
                            className="flex items-center justify-between rounded-lg px-3 py-3 -mx-3 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-base mt-0.5">{option.icon}</span>
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                            <button
                                role="switch"
                                type="button"
                                aria-checked={prefs[option.key]}
                                aria-label={`Toggle ${option.label} notifications`}
                                onClick={() => togglePref(option.key)}
                                disabled={saving}
                                className={`
                                    relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                                    transition-colors duration-200 ease-in-out
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/50
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${prefs[option.key] ? "bg-[var(--color-brand)]" : "bg-[var(--color-surface-3)]"}
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-4 w-4 rounded-full bg-white shadow-sm
                                        transform transition-transform duration-200 ease-in-out
                                        ${prefs[option.key] ? "translate-x-6" : "translate-x-1"}
                                    `}
                                />
                            </button>
                        </label>
                    ))}
                </div>

                {/* Info badge */}
                <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                    <p className="text-xs text-[var(--color-text-muted)]">
                        ℹ️ Notification delivery is not yet active. Your preferences will be saved
                        and applied once the notification system is built.
                    </p>
                </div>
            </Card>
        </section>
    );
}
