"use client";

// ─── Profile Section ────────────────────────────────────
// Client Component — handles display_name editing and avatar upload.
//
// WHY Client Component?
// - useState for form state and upload preview
// - useToast for success/error notifications
// - useRef for file input trigger
// - Clipboard API for paste support
// - Supabase browser client for Storage upload (needs user session)
// - Calls Server Action (updateProfile) for DB writes

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Input, Card } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { updateProfile } from "@/lib/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";

interface ProfileSectionProps {
    currentDisplayName: string | null;
    currentAvatarUrl: string | null;
    googleAvatarUrl: string | null;
    googleName: string | null;
    email: string;
    userId: string;
}

export default function ProfileSection({
    currentDisplayName,
    currentAvatarUrl,
    googleAvatarUrl,
    googleName,
    email,
    userId,
}: ProfileSectionProps) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── State ──────────────────────────────────────────
    const [displayName, setDisplayName] = useState(currentDisplayName ?? "");
    const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Upload-specific state
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // The effective avatar: preview → custom → google → fallback initial
    const effectiveAvatar = previewUrl || avatarUrl || googleAvatarUrl;
    const effectiveName = displayName || googleName || email.split("@")[0];

    // ─── Cleanup preview URL on unmount ─────────────────
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // ─── Process selected/pasted image ──────────────────
    const processImage = useCallback(async (file: File | Blob) => {
        try {
            const compressed = await compressImage(file);

            // Revoke old preview URL if any
            if (previewUrl) URL.revokeObjectURL(previewUrl);

            const url = URL.createObjectURL(compressed);
            setPendingBlob(compressed);
            setPreviewUrl(url);
        } catch {
            toast.error("Failed to process image. Try a different file.");
        }
    }, [previewUrl, toast]);

    // ─── File picker ────────────────────────────────────
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) processImage(file);
        // Reset input so the same file can be selected again
        e.target.value = "";
    }

    // ─── Clipboard paste ────────────────────────────────
    function handlePaste(e: React.ClipboardEvent) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
                const blob = item.getAsFile();
                if (blob) {
                    e.preventDefault();
                    processImage(blob);
                    return;
                }
            }
        }
    }

    // ─── Cancel pending upload ──────────────────────────
    function cancelPending() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPendingBlob(null);
        setPreviewUrl(null);
    }

    // ─── Remove current avatar ──────────────────────────
    function removeAvatar() {
        cancelPending();
        setAvatarUrl("");
    }

    // ─── Save ───────────────────────────────────────────
    async function handleSave() {
        setSaving(true);
        setError(null);

        let finalAvatarUrl: string | null = avatarUrl || null;

        // Upload pending image to Supabase Storage if one exists
        if (pendingBlob) {
            setUploading(true);
            try {
                const supabase = createClient();
                const filePath = `${userId}/${userId}.jpg`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, pendingBlob, {
                        contentType: "image/jpeg",
                        upsert: true,
                    });

                if (uploadError) {
                    setUploading(false);
                    setSaving(false);
                    setError(uploadError.message);
                    toast.error(uploadError.message);
                    return;
                }

                // Get the public URL
                const { data: publicUrlData } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                // Append cache-buster to force image refresh
                finalAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
                setUploading(false);
            } catch {
                setUploading(false);
                setSaving(false);
                setError("Upload failed");
                toast.error("Upload failed — please try again");
                return;
            }
        }

        // Save profile (display_name + avatar_url) via Server Action
        const result = await updateProfile({
            display_name: displayName || null,
            avatar_url: finalAvatarUrl,
        });

        setSaving(false);

        if (result.success) {
            toast.success("Profile updated");
            // Clean up preview state — the saved URL is now the source of truth
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPendingBlob(null);
            setPreviewUrl(null);
            if (finalAvatarUrl) setAvatarUrl(finalAvatarUrl);
        } else {
            setError(result.error ?? "Failed to save");
            toast.error(result.error ?? "Failed to save");
        }
    }

    // ─── Render ─────────────────────────────────────────
    const buttonLabel = saving
        ? uploading
            ? "Uploading…"
            : "Saving…"
        : "Save Profile";

    return (
        <section onPaste={handlePaste}>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
                👤 User Profile
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Customize how you appear across the dashboard.
            </p>

            <Card>
                <div className="space-y-6">
                    {/* ── Avatar Preview + Upload ── */}
                    <div className="flex items-center gap-4">
                        {/* Clickable avatar */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-border)] transition-all hover:border-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/50"
                            aria-label="Change profile photo"
                        >
                            {effectiveAvatar ? (
                                <Image
                                    src={effectiveAvatar}
                                    alt={effectiveName}
                                    fill
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                    sizes="80px"
                                    unoptimized={!!previewUrl}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--color-brand)] text-2xl font-bold text-white">
                                    {effectiveName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="text-xs font-medium text-white">Change</span>
                            </div>
                        </button>

                        <div className="min-w-0 space-y-1.5">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                    {effectiveName}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {email}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-md bg-[var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-3)]"
                                >
                                    {pendingBlob ? "Choose different" : "Change photo"}
                                </button>
                                {(avatarUrl || pendingBlob) && (
                                    <button
                                        type="button"
                                        onClick={removeAvatar}
                                        className="rounded-md px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {/* Pending badge */}
                            {pendingBlob && (
                                <p className="text-xs text-amber-400">
                                    ⚠ New photo selected — click Save Profile to apply
                                </p>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            aria-hidden="true"
                        />
                    </div>

                    {/* Paste hint */}
                    <p className="text-xs text-[var(--color-text-muted)]">
                        💡 You can also paste an image from your clipboard anywhere in this section.
                    </p>

                    {/* ── Display Name ── */}
                    <Input
                        label="Display name"
                        placeholder={googleName ?? email.split("@")[0]}
                        value={displayName}
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            setError(null);
                        }}
                        maxLength={50}
                        error={error ?? undefined}
                        helperText="Letters, numbers, spaces, hyphens, underscores, and periods. Max 50 characters. Leave empty to use your Google name."
                    />

                    {/* ── Save Button ── */}
                    <div className="flex justify-end">
                        {pendingBlob && (
                            <button
                                type="button"
                                onClick={cancelPending}
                                disabled={saving}
                                className="mr-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                            >
                                Cancel photo
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="
                                rounded-lg bg-[var(--color-brand)] px-5 py-2
                                text-sm font-medium text-white
                                transition-all duration-200
                                hover:bg-[var(--color-brand-hover)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/50
                            "
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </div>
            </Card>
        </section>
    );
}
