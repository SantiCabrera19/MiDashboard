// ─── Notifications Data Queries ─────────────────────────
// Server-side function that aggregates notifications from
// existing tables. No dedicated notifications table needed.
//
// SOURCES:
// 1. youtube_videos (is_notified = false, channel notify_new = true)
// 2. calendar_events (start_time within next 48 hours)
// 3. debts (status = active, next_due_date within 7 days)

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
    id: string;
    type: "video" | "calendar" | "debt";
    title: string;
    description: string;
    icon: string;
    href: string;
    timestamp: string; // ISO string for sorting
    isRead: boolean; // true if already seen
};

export const getNotifications = cache(async function getNotifications(): Promise<NotificationItem[]> {
    const supabase = await createClient();
    const notifications: NotificationItem[] = [];

    // --- SOURCE 1: Unnotified videos from channels with notify_new = true ---
    const { data: channels } = await supabase
        .from("youtube_channels")
        .select("id, channel_name")
        .eq("notify_new", true);

    if (channels && channels.length > 0) {
        const channelIds = channels.map((c) => c.id);
        const { data: videos } = await supabase
            .from("youtube_videos")
            .select("id, title, channel_id, published_at, thumbnail")
            .eq("is_notified", false)
            .in("channel_id", channelIds)
            .order("published_at", { ascending: false });

        if (videos && videos.length > 0) {
            // Group by channel
            const byChannel = new Map<string, typeof videos>();
            for (const v of videos) {
                if (!v.channel_id) continue;
                if (!byChannel.has(v.channel_id)) byChannel.set(v.channel_id, []);
                byChannel.get(v.channel_id)!.push(v);
            }

            for (const [channelId, channelVideos] of byChannel) {
                const channel = channels.find((c) => c.id === channelId);
                const count = channelVideos.length;
                const latest = channelVideos[0];
                notifications.push({
                    id: `video-${channelId}`,
                    type: "video",
                    title: count === 1 ? latest.title : `${count} new videos`,
                    description:
                        count === 1
                            ? `New from ${channel?.channel_name ?? "channel"}`
                            : `From ${channel?.channel_name ?? "channel"}`,
                    icon: "🎬",
                    href: "/videos",
                    timestamp: latest.published_at,
                    isRead: false,
                });
            }
        }
    }

    // --- SOURCE 2: Calendar events in the next 48 hours ---
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data: events } = await supabase
        .from("calendar_events")
        .select("id, title, start_time, all_day, event_type")
        .gte("start_time", now.toISOString())
        .lte("start_time", in48h.toISOString())
        .order("start_time", { ascending: true });

    if (events) {
        for (const event of events) {
            const start = new Date(event.start_time);
            const isToday = start.toDateString() === now.toDateString();
            notifications.push({
                id: `calendar-${event.id}`,
                type: "calendar",
                title: event.title,
                description: isToday
                    ? `Today at ${start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                    : `Tomorrow at ${start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`,
                icon: "📅",
                href: "/calendar",
                timestamp: event.start_time,
                isRead: false,
            });
        }
    }

    // --- SOURCE 3: Debts due in the next 7 days ---
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: debts } = await supabase
        .from("debts")
        .select("id, title, next_due_date, monthly_payment")
        .eq("status", "active")
        .not("next_due_date", "is", null)
        .gte("next_due_date", now.toISOString().split("T")[0])
        .lte("next_due_date", in7d.toISOString().split("T")[0])
        .order("next_due_date", { ascending: true });

    if (debts) {
        for (const debt of debts) {
            notifications.push({
                id: `debt-${debt.id}`,
                type: "debt",
                title: debt.title,
                description: `Payment due: $${Number(debt.monthly_payment ?? 0).toLocaleString("es-AR")}`,
                icon: "💳",
                href: "/finances",
                timestamp: `${debt.next_due_date}T00:00:00.000Z`,
                isRead: false,
            });
        }
    }

    // Sort all notifications by timestamp descending
    notifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return notifications;
});
