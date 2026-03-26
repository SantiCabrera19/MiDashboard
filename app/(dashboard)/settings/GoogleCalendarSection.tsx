"use client";

// ─── Google Calendar Section ─────────────────────────────
// Client Component — Connect / Disconnect Google Calendar OAuth2.
//
// WHY Client Component?
// - useTransition for non-blocking Server Action calls
// - useSearchParams to read ?google=connected|error feedback
// - useToast for success/error notifications

import { useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import {
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncGoogleCalendarEvents,
} from "@/lib/actions/google-calendar";
import type { GoogleCalendarStatus } from "@/lib/actions/google-calendar";

interface GoogleCalendarSectionProps {
    status: GoogleCalendarStatus;
}

export default function GoogleCalendarSection({
    status,
}: GoogleCalendarSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [isSyncing, startSync] = useTransition();
    const toast = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Show feedback toast from OAuth redirect result (?google=connected|error)
    useEffect(() => {
        const result = searchParams.get("google");
        if (result === "connected") {
            toast.success("Google Calendar connected successfully!");
            router.replace("/settings");
        } else if (result === "error") {
            toast.error("Failed to connect Google Calendar. Please try again.");
            router.replace("/settings");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleDisconnect() {
        startTransition(async () => {
            const result = await disconnectGoogleCalendar();
            if (result.success) {
                toast.success("Google Calendar disconnected.");
            } else {
                toast.error(result.error ?? "Failed to disconnect.");
            }
        });
    }

    function handleConnect() {
        startTransition(async () => {
            await connectGoogleCalendar();
        });
    }

    function handleSync() {
        startSync(async () => {
            const result = await syncGoogleCalendarEvents();
            if (result.success) {
                toast.success(`Synced ${result.count} event${result.count === 1 ? "" : "s"} from Google Calendar`);
            } else {
                toast.error(result.error ?? "Sync failed. Please try again.");
            }
        });
    }

    const formattedDate = status.connectedAt
        ? new Date(status.connectedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    return (
        <section>
            {/* Section header */}
            <div className="mb-4">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                    📅 Google Calendar
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Connect your Google Calendar to import events into MeDashboard.
                    Read-only — we never write back to your calendar.
                </p>
            </div>

            <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Status info */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-2)] text-xl">
                            📅
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                Google Calendar
                            </p>
                            {status.connected ? (
                                <div className="mt-0.5 flex items-center gap-2">
                                    <Badge variant="success">✅ Connected</Badge>
                                    {formattedDate && (
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            since {formattedDate}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                    Not connected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    {status.connected ? (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSync}
                                disabled={isSyncing || isPending}
                            >
                                {isSyncing ? "Syncing..." : "🔄 Sync now"}
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDisconnect}
                                disabled={isPending || isSyncing}
                            >
                                {isPending ? "Disconnecting..." : "Disconnect"}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleConnect}
                            disabled={isPending}
                        >
                            {isPending ? "Redirecting..." : "Connect Google Calendar"}
                        </Button>
                    )}
                </div>
            </Card>
        </section>
    );
}
