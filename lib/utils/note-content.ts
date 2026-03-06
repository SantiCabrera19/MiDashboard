// ─── Note Content Utilities ──────────────────────────────
// Helpers for determining how to render note content.
//
// Notes stored before TipTap will be plain text with \n line breaks.
// Notes created via TipTap will be HTML strings (<p>, <strong>, etc.).
// This helper lets components decide which rendering strategy to use.

/**
 * Detect whether a string is HTML content (from TipTap) or plain text (legacy).
 * Returns true if the content starts with an HTML tag.
 */
export function isHtmlContent(content: string): boolean {
    return /^\s*<[a-z][\s\S]*>/i.test(content);
}

/**
 * Convert plain text to safe HTML for rendering.
 * Escapes HTML entities and converts \n to <br />.
 */
export function plainTextToHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br />");
}
