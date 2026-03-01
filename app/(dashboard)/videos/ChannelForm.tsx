"use client";

// ─── ChannelForm ────────────────────────────────────────
// Client Component — modal to follow a YouTube channel.
// User pastes a URL or @handle, system resolves it via YouTube API.

import { useState, useTransition } from "react";
import { Modal, Input, Button } from "@/components/ui";
import { followChannel } from "@/lib/actions/videos";

interface ChannelFormProps {
    open: boolean;
    onClose: () => void;
}

export default function ChannelForm({ open, onClose }: ChannelFormProps) {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!input.trim()) {
            setError("Please enter a channel URL or handle");
            return;
        }

        startTransition(async () => {
            const result = await followChannel(input.trim());

            if (result.success) {
                setInput("");
                onClose();
            } else {
                setError(result.error ?? "Something went wrong");
            }
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Follow YouTube Channel"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Input
                        label="Channel URL or Handle"
                        placeholder="https://youtube.com/@midudev or @midudev"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        required
                    />
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Supports: @handle, full URL, or channel ID (UCxxxxxxxx)
                    </p>
                </div>

                {error && (
                    <p className="text-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {isPending && (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        🔍 Fetching channel info and latest videos...
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                        Follow Channel
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
