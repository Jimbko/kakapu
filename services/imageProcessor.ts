import { makeUrlAbsolute } from '../utils/urlHelpers';

export const DEBUG_IMAGES = true; // For development logging

// --- Types ---

export interface ShikimoriImageObject {
    original?: string;
    preview?: string;
    x96?: string;
    x48?: string;
}

export interface PosterSource {
    endpoint: 'detail' | 'list' | 'franchise' | 'alternative';
    size: 'original' | 'preview' | 'x96' | 'x48';
    url: string;
}

export interface ProcessedImage {
    original: string;
    preview: string;
    x96: string;
    x48: string;
}

export interface PosterSelectionResult {
    image: ProcessedImage | null;
    sourceInfo: PosterSource | null;
    isPlaceholder: boolean;
}

// --- Logic ---

/**
 * Checks if a URL points to a known Shikimori placeholder image.
 * @param url The URL to check.
 * @returns True if the URL is a placeholder.
 */
export const isPlaceholderUrl = (url: string | undefined | null): boolean => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    const badPatterns = [
        '/assets/globals/missing',
        '404',
        'not_found',
        'placeholder',
        'no_image',
    ];
    return badPatterns.some(pattern => lowerUrl.includes(pattern));
};

/**
 * Intelligently selects the best available poster from multiple sources based on a priority list.
 * @param detailImage The image object from the /api/animes/{id} endpoint.
 * @param listImage The image object from the /api/animes?ids={id} endpoint.
 * @returns A PosterSelectionResult containing the best image or null if none are valid.
 */
export const selectBestPoster = (
    detailImage: ShikimoriImageObject | null,
    listImage: ShikimoriImageObject | null
): PosterSelectionResult => {
    // Define priority order
    const priorityOrder: Array<{ endpoint: 'list' | 'detail'; size: 'original' | 'preview' | 'x96' | 'x48'; url: string | undefined }> = [
        { endpoint: 'list',   size: 'original', url: listImage?.original },
        { endpoint: 'detail', size: 'original', url: detailImage?.original },
        { endpoint: 'list',   size: 'preview',  url: listImage?.preview },
        { endpoint: 'detail', size: 'preview',  url: detailImage?.preview },
        { endpoint: 'list',   size: 'x96',      url: listImage?.x96 },
        { endpoint: 'detail', size: 'x96',      url: detailImage?.x96 },
        { endpoint: 'list',   size: 'x48',      url: listImage?.x48 },
        { endpoint: 'detail', size: 'x48',      url: detailImage?.x48 },
    ];
    
    for (const source of priorityOrder) {
        if (!source.url) continue;
        
        const absoluteUrl = makeUrlAbsolute(source.url);
        if (!isPlaceholderUrl(absoluteUrl)) {
            // Found a valid poster. Now, construct the full image object.
            // We'll use the best available URLs for all sizes, preferring the original if others are missing.
            const original = makeUrlAbsolute(listImage?.original || detailImage?.original || absoluteUrl);
            const preview = makeUrlAbsolute(listImage?.preview || detailImage?.preview || original);
            const x96 = makeUrlAbsolute(listImage?.x96 || detailImage?.x96 || preview);
            const x48 = makeUrlAbsolute(listImage?.x48 || detailImage?.x48 || x96);

            return {
                image: { original, preview, x96, x48 },
                sourceInfo: { endpoint: source.endpoint, size: source.size, url: source.url },
                isPlaceholder: false,
            };
        }
    }

    // No valid poster found in any source
    return {
        image: null,
        sourceInfo: null,
        isPlaceholder: true,
    };
};

/**
 * Пытается получить постер через альтернативные методы для аниме без постера в API
 */
export const tryAlternativePosterSources = async (animeId: number, animeName: string): Promise<string | null> => {
    const DEBUG = true;
    
    // Метод 1: Попробовать прямой URL к постеру (иногда работает)
    const directUrls = [
        `https://shikimori.one/system/animes/original/${animeId}.jpg`,
        `https://shikimori.one/system/animes/original/${animeId}.png`,
        `https://desu.shikimori.one/system/animes/original/${animeId}.jpg`,
        `https://desu.shikimori.one/system/animes/original/${animeId}.png`,
        `https://moe.shikimori.one/system/animes/original/${animeId}.jpg`,
        `https://moe.shikimori.one/system/animes/original/${animeId}.png`,
    ];
    
    for (const url of directUrls) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
                if (DEBUG) console.log(`✅ Found poster via direct URL: ${url}`);
                return url;
            }
        } catch (e) {
            continue;
        }
    }
    
    // Метод 2: Поиск через GraphQL API (если есть доступ)
    try {
        const graphqlQuery = {
            query: `
                query {
                    animes(ids: "${animeId}", limit: 1) {
                        id
                        poster {
                            originalUrl
                            mainUrl
                        }
                    }
                }
            `
        };
        
        const response = await fetch('https://shikimori.one/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            body: JSON.stringify(graphqlQuery)
        });
        
        if (response.ok) {
            const data = await response.json();
            const posterUrl = data?.data?.animes?.[0]?.poster?.originalUrl;
            if (posterUrl && !isPlaceholderUrl(posterUrl)) {
                if (DEBUG) console.log(`✅ Found poster via GraphQL: ${posterUrl}`);
                return makeUrlAbsolute(posterUrl);
            }
        }
    } catch (e) {
        if (DEBUG) console.log('GraphQL attempt failed:', e);
    }
    
    // Метод 3: Использовать внешние базы данных аниме
    // MyAnimeList, AniList, Kitsu - у них часто есть постеры
    try {
        // Поиск в AniList (у них открытый GraphQL API)
        const anilistQuery = {
            query: `
                query ($name: String) {
                    Media(search: $name, type: ANIME) {
                        coverImage {
                            extraLarge
                            large
                        }
                    }
                }
            `,
            variables: {
                name: animeName
            }
        };
        
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(anilistQuery)
        });
        
        if (response.ok) {
            const data = await response.json();
            const coverUrl = data?.data?.Media?.coverImage?.extraLarge || data?.data?.Media?.coverImage?.large;
            if (coverUrl) {
                if (DEBUG) console.log(`✅ Found poster via AniList: ${coverUrl}`);
                return coverUrl;
            }
        }
    } catch (e) {
        if (DEBUG) console.log('AniList attempt failed:', e);
    }
    
    if (DEBUG) console.log(`❌ No alternative poster found for anime ${animeId}`);
    return null;
};
