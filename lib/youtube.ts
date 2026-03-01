// ─── YouTube Data API Client ────────────────────────────
// Server-side utility for interacting with YouTube Data API v3.
//
// IMPORTANT — API Quota:
// - Daily limit: 10,000 units
// - channels.list: 1 unit
// - playlistItems.list: 1 unit (we use this instead of search.list at 100 units)
// - Total per "follow channel": ~2 units
//
// We use playlistItems.list to fetch videos from the uploads playlist,
// which is 100x cheaper than search.list.

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// ─── Types ──────────────────────────────────────────────

export interface YouTubeChannelInfo {
    channelId: string;
    channelName: string;
    channelThumbnail: string;
    uploadsPlaylistId: string;
}

export interface YouTubeVideoInfo {
    videoId: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
}

// YouTube API response types (partial, only what we need)
interface YouTubeChannelSnippet {
    title: string;
    thumbnails: {
        default?: { url: string };
        medium?: { url: string };
    };
}

interface YouTubeChannelContentDetails {
    relatedPlaylists: {
        uploads: string;
    };
}

interface YouTubeChannelItem {
    id: string;
    snippet: YouTubeChannelSnippet;
    contentDetails: YouTubeChannelContentDetails;
}

interface YouTubePlaylistItem {
    snippet: {
        resourceId: { videoId: string };
        title: string;
        thumbnails: {
            default?: { url: string };
            medium?: { url: string };
            high?: { url: string };
        };
        publishedAt: string;
    };
}

// ─── URL Parsing ────────────────────────────────────────

/**
 * Parse a YouTube channel URL/handle into a usable identifier.
 * Supports:
 *   - https://youtube.com/@handle
 *   - https://youtube.com/channel/UCxxxxxxxx
 *   - @handle
 *   - UCxxxxxxxx (raw channel ID)
 */
export function parseChannelInput(input: string): {
    type: "handle" | "id";
    value: string;
} {
    const trimmed = input.trim();

    // youtube.com/@handle
    const handleMatch = trimmed.match(
        /(?:youtube\.com|youtu\.be)\/@([^/?\s]+)/
    );
    if (handleMatch) return { type: "handle", value: handleMatch[1] };

    // youtube.com/channel/UCxxxxx
    const channelMatch = trimmed.match(
        /youtube\.com\/channel\/(UC[^/?\s]+)/
    );
    if (channelMatch) return { type: "id", value: channelMatch[1] };

    // Just @handle
    if (trimmed.startsWith("@")) return { type: "handle", value: trimmed.slice(1) };

    // Raw channel ID
    if (trimmed.startsWith("UC") && trimmed.length > 10) {
        return { type: "id", value: trimmed };
    }

    // Assume it's a handle
    return { type: "handle", value: trimmed };
}

// ─── API Functions ──────────────────────────────────────

function getApiKey(): string {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) throw new Error("YOUTUBE_API_KEY not configured in .env.local");
    return key;
}

/**
 * Fetch channel info from YouTube Data API.
 * Cost: 1 unit.
 */
export async function fetchChannelInfo(
    input: string
): Promise<YouTubeChannelInfo> {
    const apiKey = getApiKey();
    const parsed = parseChannelInput(input);

    const params = new URLSearchParams({
        part: "snippet,contentDetails",
        key: apiKey,
    });

    if (parsed.type === "handle") {
        params.set("forHandle", parsed.value);
    } else {
        params.set("id", parsed.value);
    }

    const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message ?? "YouTube API error");
    }

    const items = data.items as YouTubeChannelItem[] | undefined;
    if (!items?.length) {
        throw new Error("Channel not found. Check the URL or handle.");
    }

    const channel = items[0];
    return {
        channelId: channel.id,
        channelName: channel.snippet.title,
        channelThumbnail:
            channel.snippet.thumbnails?.medium?.url ??
            channel.snippet.thumbnails?.default?.url ??
            "",
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    };
}

/**
 * Fetch latest videos from a channel's uploads playlist.
 * Cost: 1 unit per call.
 *
 * Uses playlistItems.list instead of search.list (100x cheaper).
 */
export async function fetchChannelVideos(
    uploadsPlaylistId: string,
    maxResults: number = 15
): Promise<YouTubeVideoInfo[]> {
    const apiKey = getApiKey();

    const params = new URLSearchParams({
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: String(maxResults),
        key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params}`);
    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message ?? "YouTube API error");
    }

    const items = data.items as YouTubePlaylistItem[] | undefined;

    return (items ?? []).map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail:
            item.snippet.thumbnails?.medium?.url ??
            item.snippet.thumbnails?.high?.url ??
            item.snippet.thumbnails?.default?.url ??
            "",
        publishedAt: item.snippet.publishedAt,
    }));
}
