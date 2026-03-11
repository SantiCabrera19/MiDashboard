// ─── Image Compression Utility ──────────────────────────
// Client-side only — uses Canvas API to resize and compress.
// Zero dependencies. Works in all modern browsers.
//
// WHY client-side?
// - No server round-trip for compression
// - Keeps upload payload small (~50-100KB)
// - Canvas API is universally supported
//
// USAGE:
//   const compressed = await compressImage(file, { maxSize: 400, quality: 0.85 });
//   // compressed is a Blob (JPEG)

interface CompressOptions {
    /** Max width/height in pixels (maintains aspect ratio) */
    maxSize?: number;
    /** JPEG quality 0-1 */
    quality?: number;
}

const DEFAULTS: Required<CompressOptions> = {
    maxSize: 400,
    quality: 0.85,
};

/**
 * Compress an image file to JPEG using Canvas API.
 * Resizes to fit within maxSize × maxSize while maintaining aspect ratio.
 * Returns a compressed JPEG Blob.
 */
export async function compressImage(
    file: File | Blob,
    options?: CompressOptions
): Promise<Blob> {
    const { maxSize, quality } = { ...DEFAULTS, ...options };

    // Load the image into an HTMLImageElement
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // Calculate scaled dimensions (fit within maxSize × maxSize)
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        targetWidth = Math.round(width * ratio);
        targetHeight = Math.round(height * ratio);
    }

    // Draw onto an OffscreenCanvas (or regular canvas as fallback)
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    // Convert to JPEG blob
    const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality,
    });

    return blob;
}
