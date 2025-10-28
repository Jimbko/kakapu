const SHIKIMORI_BASE_URL = 'https://shikimori.one';

/**
 * Ensures a URL is absolute. If it's relative, it prepends the Shikimori base URL.
 * @param url The URL to process.
 * @returns An absolute URL or an empty string if the input is falsy.
 */
export const makeUrlAbsolute = (url: string | undefined | null): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SHIKIMORI_BASE_URL}${url}`;
};
