"use server";

// ─── Google Calendar Server Actions ─────────────────────
// Handles OAuth2 connection lifecycle + event sync for Google Calendar.
//
// FLOW (connect):
// 1. connectGoogleCalendar() → redirects user to Google consent screen
// 2. Google redirects back to /auth/google-calendar/callback
// 3. Callback stores tokens in google_tokens table
// 4. disconnectGoogleCalendar() deletes the token row
//
// FLOW (sync):
// 1. syncGoogleCalendarEvents() → refreshes token if needed
// 2. Fetches events from Google Calendar API (primary calendar)
// 3. Maps to our calendar_events schema
// 4. Upserts on google_event_id — idempotent, no duplicates
//
// Scopes: calendar.readonly — we NEVER write back to Google Calendar.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Google colorId → hex map ────────────────────────────
// https://developers.google.com/calendar/api/v3/reference/colors
const GOOGLE_COLOR_MAP: Record<string, string> = {
    "1":  "#7986CB", // Lavender
    "2":  "#33B679", // Sage
    "3":  "#8E24AA", // Grape
    "4":  "#E67C73", // Flamingo
    "5":  "#F6BF26", // Banana
    "6":  "#F4511E", // Tangerine
    "7":  "#039BE5", // Peacock
    "8":  "#616161", // Graphite
    "9":  "#3F51B5", // Blueberry
    "10": "#0B8043", // Basil
    "11": "#D50000", // Tomato
};
const GOOGLE_DEFAULT_COLOR = "#4285F4";

// ─── Google API types ────────────────────────────────────
interface GoogleEventDateTime {
    dateTime?: string;
    date?: string;
    timeZone?: string;
}

interface GoogleEvent {
    id: string;
    summary?: string;
    description?: string;
    colorId?: string;
    start: GoogleEventDateTime;
    end: GoogleEventDateTime;
    status?: string;
}

interface GoogleEventsResponse {
    items?: GoogleEvent[];
}

type ActionResponse = {
    success: boolean;
    error?: string;
};

type SyncResponse = {
    success: boolean;
    count: number;
    error?: string;
};

export type GoogleCalendarStatus = {
    connected: boolean;
    connectedAt: string | null;
};

/**
 * Redirects the user to Google OAuth2 consent screen.
 * Requests calendar.readonly scope + offline access (refresh token).
 */
export async function connectGoogleCalendar(): Promise<never> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    console.log("[google-calendar] env check:", {
        clientId: !!process.env.GOOGLE_CLIENT_ID,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (!clientId || !appUrl) {
        throw new Error("Missing GOOGLE_CLIENT_ID or NEXT_PUBLIC_APP_URL env vars");
    }

    const redirectUri = `${appUrl}/auth/google-calendar/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        access_type: "offline",
        prompt: "consent",
    });

    redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

/**
 * Deletes the google_tokens row for the current user,
 * effectively disconnecting Google Calendar.
 */
export async function disconnectGoogleCalendar(): Promise<ActionResponse> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("google_tokens")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        console.error("Error disconnecting Google Calendar:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Internal helper — returns a valid access token for userId,
 * refreshing it first if it expires within the next 5 minutes.
 * Returns null if no token exists or refresh fails.
 */
async function refreshGoogleToken(userId: string): Promise<string | null> {
    const supabase = await createClient();

    const { data: tokenRow } = await supabase
        .from("google_tokens")
        .select("access_token, refresh_token, expires_at")
        .eq("user_id", userId)
        .maybeSingle();

    if (!tokenRow) return null;

    // If token is still valid for more than 5 minutes, use it as-is
    const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at) : null;
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiresAt && expiresAt > fiveMinutesFromNow) {
        return tokenRow.access_token;
    }

    // Token is expired or near expiry — refresh it
    if (!tokenRow.refresh_token) {
        console.error("No refresh_token available for user:", userId);
        return null;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenRow.refresh_token,
            grant_type: "refresh_token",
        }),
    });

    if (!res.ok) {
        console.error("Failed to refresh Google token:", await res.text());
        return null;
    }

    const refreshed = (await res.json()) as {
        access_token: string;
        expires_in: number;
        token_type: string;
    };

    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    await supabase
        .from("google_tokens")
        .update({
            access_token: refreshed.access_token,
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    return refreshed.access_token;
}

/**
 * Fetches events from the user's primary Google Calendar (±30/90 days)
 * and upserts them into calendar_events.
 * Idempotent — running it twice produces no duplicates (onConflict: google_event_id).
 */
export async function syncGoogleCalendarEvents(): Promise<SyncResponse> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, count: 0, error: "Not authenticated" };

    const accessToken = await refreshGoogleToken(user.id);
    if (!accessToken) {
        return {
            success: false,
            count: 0,
            error: "No valid Google token. Please reconnect Google Calendar.",
        };
    }

    const now = new Date();
    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        maxResults: "250",
        orderBy: "startTime",
    });

    const apiRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!apiRes.ok) {
        console.error("Google Calendar API error:", await apiRes.text());
        return { success: false, count: 0, error: "Failed to fetch events from Google Calendar" };
    }

    const { items = [] }: GoogleEventsResponse = await apiRes.json();

    // Filter out cancelled events
    const activeItems = items.filter((e) => e.status !== "cancelled");

    if (activeItems.length === 0) {
        revalidatePath("/calendar");
        return { success: true, count: 0 };
    }

    const syncedAt = new Date().toISOString();

    const mappedEvents = activeItems.map((event) => ({
        user_id: user.id,
        google_event_id: event.id,
        title: event.summary ?? "(No title)",
        description: event.description ?? null,
        start_time: event.start.dateTime ?? `${event.start.date}T00:00:00.000Z`,
        end_time: event.end.dateTime ?? `${event.end.date}T23:59:59.000Z`,
        all_day: !event.start.dateTime,
        color: GOOGLE_COLOR_MAP[event.colorId ?? ""] ?? GOOGLE_DEFAULT_COLOR,
        source: "google",
        synced_with_google: true,
        last_synced_at: syncedAt,
        event_type: null,
        reminder_minutes: null,
    }));

    const { error: upsertError } = await supabase
        .from("calendar_events")
        .upsert(mappedEvents, { onConflict: "google_event_id" });

    if (upsertError) {
        console.error("Error upserting Google events:", upsertError.message);
        return { success: false, count: 0, error: upsertError.message };
    }

    revalidatePath("/calendar");
    revalidatePath("/settings");
    return { success: true, count: activeItems.length };
}

/**
 * Returns whether the current user has a connected Google Calendar token.
 */
export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { connected: false, connectedAt: null };

    const { data } = await supabase
        .from("google_tokens")
        .select("created_at")
        .eq("user_id", user.id)
        .maybeSingle();

    return {
        connected: !!data,
        connectedAt: data?.created_at ?? null,
    };
}
