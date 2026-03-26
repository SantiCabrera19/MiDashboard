"use client";

import { useState } from "react";
import { Input } from "@/components/ui";

const PREDEFINED_TAGS = ["Personal", "Trabajo", "Ideas", "Importante", "Referencia"] as const;

interface TagSelectorProps {
    selected: string[];
    onChange: (tags: string[]) => void;
}

function normalizeTag(tag: string): string {
    return tag.trim().replace(/\s+/g, " ");
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
    const [inputValue, setInputValue] = useState("");

    const selectedSet = new Set(selected);

    function toggleTag(tag: string) {
        if (selectedSet.has(tag)) {
            onChange(selected.filter((t) => t !== tag));
            return;
        }
        onChange([...selected, tag]);
    }

    function addCustomTag() {
        const next = normalizeTag(inputValue);
        if (!next) return;
        if (selectedSet.has(next)) {
            setInputValue("");
            return;
        }
        onChange([...selected, next]);
        setInputValue("");
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                Tags
            </label>

            <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => {
                    const isActive = selectedSet.has(tag);
                    return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                isActive
                                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]"
                                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                            }`}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>

            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTag();
                    }
                }}
                placeholder="Agregar tag personalizado y presionar Enter..."
            />

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-text-primary)]"
                            title="Quitar tag"
                        >
                            <span>{tag}</span>
                            <span className="text-[var(--color-text-muted)]">✕</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
