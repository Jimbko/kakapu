import { ShikimoriAnime } from '../types';

const API_BASE = 'https://shikimori.one';
const PLACEHOLDER_SUBSTRING = '/assets/globals/missing_';

/**
 * Converts a relative URL from Shikimori to an absolute URL.
 * Exported for use in other services.
 */
export const makeUrlAbsolute = (relativeUrl: string | undefined | null): string => {
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
 * Processes the 'image' object from an anime to ensure all URLs are absolute.
 * This function no longer replaces posters with screenshots; that logic is now handled
 * by the data fetching service (`shikimori.ts`) which has more context. This function's
 * sole responsibility is URL processing.
 *
 * @param anime The full ShikimoriAnime object.
 * @returns A processed 'image' object with absolute URLs.
 */
export const processAnimeImages = (anime: ShikimoriAnime): ShikimoriAnime['image'] => {
    if (!anime.image) {
        // If there's no image object at all, return a default structure with empty strings.
        return { original: '', preview: '', x96: '', x48: '' };
    }
    
    return {
        original: makeUrlAbsolute(anime.image.original),
        preview: makeUrlAbsolute(anime.image.preview),
        x96: makeUrlAbsolute(anime.image.x96),
        x48: makeUrlAbsolute(anime.image.x48),
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