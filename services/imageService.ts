import { ShikimoriAnime } from '../types';

const API_BASE = 'https://shikimori.one';
const PLACEHOLDER_SUBSTRING = '/assets/globals/missing_';

/**
 * Converts a relative URL from Shikimori to an absolute URL.
 */
const makeUrlAbsolute = (relativeUrl: string | undefined | null): string => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl; // Already absolute
    return `${API_BASE}${relativeUrl}`;
};

/**
 * Checks if an image URL is a placeholder.
 * Exported for use in other services.
 */
export const isPlaceholder = (url: string | undefined | null): boolean => {
    return !!url && url.includes(PLACEHOLDER_SUBSTRING);
};

/**
 * Processes the 'image' object from an anime to provide the best possible visual representation,
 * prioritizing quality above all else.
 *
 * This function implements a quality-first strategy:
 * 1. It determines the single best image URL available (either the original poster or the first screenshot as a fallback).
 * 2. It then assigns this high-quality URL to ALL image size variants (original, preview, x96, x48).
 *
 * This eliminates issues with blurry or pixelated images caused by upscaling smaller, pre-sized variants like 'preview' or 'x96',
 * ensuring a crisp and visually appealing presentation across all components of the application.
 *
 * @param anime The full ShikimoriAnime object, which may have been augmented with separately fetched screenshots.
 * @returns A processed 'image' object where all variants point to the highest-quality available image source.
 */
export const processAnimeImages = (anime: ShikimoriAnime): ShikimoriAnime['image'] => {
    const absoluteOriginalPoster = makeUrlAbsolute(anime.image.original);
    const isPosterPlaceholder = isPlaceholder(absoluteOriginalPoster);
    const firstScreenshot = anime.screenshots?.[0];

    let bestImageUrl = absoluteOriginalPoster;

    // If the main poster is a placeholder AND we have a screenshot (which is only true on individual anime pages),
    // we use the original, high-quality screenshot as the definitive image source.
    if (isPosterPlaceholder && firstScreenshot) {
        bestImageUrl = makeUrlAbsolute(firstScreenshot.original);
    }
    
    // Assign the determined best image URL to all size variants.
    // This is the core of the quality-first strategy. It ensures that no matter which
    // variant a component requests (e.g., 'preview' in profile lists), it receives
    // the highest resolution image, thus preventing blurriness.
    return {
        original: bestImageUrl,
        preview: bestImageUrl,
        x96: bestImageUrl,
        x48: bestImageUrl,
    };
};


/**
 * Processes an array of screenshots, making their URLs absolute.
 */
export const processScreenshots = (screenshots: ShikimoriAnime['screenshots'] | undefined): ShikimoriAnime['screenshots'] => {
    if (!screenshots) return [];
    return screenshots.map(s => ({
        original: makeUrlAbsolute(s.original),
        preview: makeUrlAbsolute(s.preview),
    }));
};