"use client";

// ─── Widget Visibility Section ──────────────────────────
// Client Component — toggles for Home page stat cards and content sections.
//
// WHY Client Component?
// - Interactive toggle switches need state management
// - Calls Server Action (updatePreferences) on toggle

import { useState } from "react";
import { Card } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { updatePreferences } from "@/lib/actions/settings";
import type { VisibleStatCards, VisibleSections } from "@/lib/data/settings";

interface WidgetVisibilitySectionProps {
    statCards: VisibleStatCards;
    sections: VisibleSections;
}

// ─── Toggle Config ──────────────────────────────────────

const STAT_CARD_OPTIONS: { key: keyof VisibleStatCards; label: string; icon: string }[] = [
    { key: "notes", label: "Notes", icon: "📝" },
    { key: "balance", label: "Balance", icon: "💰" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "videos", label: "Videos", icon: "🎬" },
];

const SECTION_OPTIONS: { key: keyof VisibleSections; label: string; icon: string }[] = [
    { key: "recent_notes", label: "Recent Notes", icon: "📝" },
    { key: "upcoming_events", label: "Upcoming Events", icon: "📅" },
    { key: "recent_transactions", label: "Recent Transactions", icon: "💰" },
];

export default function WidgetVisibilitySection({
    statCards: initialStatCards,
    sections: initialSections,
}: WidgetVisibilitySectionProps) {
    const toast = useToast();
    const [statCards, setStatCards] = useState<VisibleStatCards>(initialStatCards);
    const [sections, setSections] = useState<VisibleSections>(initialSections);
    const [saving, setSaving] = useState(false);

    // ─── Toggle Handlers ────────────────────────────────

    async function toggleStatCard(key: keyof VisibleStatCards) {
        const updated = { ...statCards, [key]: !statCards[key] };
        setStatCards(updated);
        await save({ visible_stat_cards: updated });
    }

    async function toggleSection(key: keyof VisibleSections) {
        const updated = { ...sections, [key]: !sections[key] };
        setSections(updated);
        await save({ visible_sections: updated });
    }

    async function save(data: {
        visible_stat_cards?: VisibleStatCards;
        visible_sections?: VisibleSections;
    }) {
        setSaving(true);
        const result = await updatePreferences(data);
        setSaving(false);

        if (!result.success) {
            toast.error(result.error ?? "Failed to save preferences");
        }
    }

    return (
        <section>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
                🏠 Home Page Widgets
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Choose which cards and sections appear on your Home page.
            </p>

            <div className="space-y-4">
                {/* ── Stat Cards ── */}
                <Card>
                    <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                        Stat Cards
                    </h3>
                    <div className="space-y-2">
                        {STAT_CARD_OPTIONS.map((option) => (
                            <ToggleRow
                                key={option.key}
                                icon={option.icon}
                                label={option.label}
                                checked={statCards[option.key]}
                                onChange={() => toggleStatCard(option.key)}
                                disabled={saving}
                            />
                        ))}
                    </div>
                </Card>

                {/* ── Content Sections ── */}
                <Card>
                    <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                        Content Sections
                    </h3>
                    <div className="space-y-2">
                        {SECTION_OPTIONS.map((option) => (
                            <ToggleRow
                                key={option.key}
                                icon={option.icon}
                                label={option.label}
                                checked={sections[option.key]}
                                onChange={() => toggleSection(option.key)}
                                disabled={saving}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </section>
    );
}

// ─── Toggle Row ─────────────────────────────────────────
// Reusable toggle switch row with label and icon.

function ToggleRow({
    icon,
    label,
    checked,
    onChange,
    disabled,
}: {
    icon: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
}) {
    return (
        <label className="flex items-center justify-between rounded-lg px-3 py-2.5 -mx-3 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
            </div>
            <button
                role="switch"
                type="button"
                aria-checked={checked}
                aria-label={`Toggle ${label}`}
                onClick={onChange}
                disabled={disabled}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                    transition-colors duration-200 ease-in-out
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${checked ? "bg-[var(--color-brand)]" : "bg-[var(--color-surface-3)]"}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 rounded-full bg-white shadow-sm
                        transform transition-transform duration-200 ease-in-out
                        ${checked ? "translate-x-6" : "translate-x-1"}
                    `}
                />
            </button>
        </label>
    );
}
