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
            
            // Helper to find the first valid (non-placeholder) URL from a list of candidates.
            const getBestUrl = (...urls: (string | undefined | null)[]): string | null => {
                for (const url of urls) {
                    if (url && !isPlaceholderUrl(url)) {
                        return url;
                    }
                }
                return null; // Return null if no valid URL is found.
            };

            const bestOriginal = getBestUrl(listImage?.original, detailImage?.original);
            const bestPreview = getBestUrl(listImage?.preview, detailImage?.preview);
            const bestX96 = getBestUrl(listImage?.x96, detailImage?.x96);
            const bestX48 = getBestUrl(listImage?.x48, detailImage?.x48);

            // Cascade to find a fallback if a specific size is missing, from best to worst quality.
            const fallback = makeUrlAbsolute(bestOriginal || bestPreview || bestX96 || bestX48);

            const finalOriginal = makeUrlAbsolute(bestOriginal || fallback);
            const finalPreview = makeUrlAbsolute(bestPreview || finalOriginal);
            const finalX96 = makeUrlAbsolute(bestX96 || finalPreview);
            const finalX48 = makeUrlAbsolute(bestX48 || finalX96);

            return {
                image: { 
                    original: finalOriginal, 
                    preview: finalPreview, 
                    x96: finalX96, 
                    x48: finalX48 
                },
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
 * Helper function to check if an image URL is accessible and valid.
 * Uses the Image object which is more reliable for cross-origin checks than fetch.
 * @param url The URL of the image to check.
 * @returns A promise that resolves to true if the image loads, false otherwise.
 */
const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        let settled = false;

        const done = (result: boolean) => {
            if (!settled) {
                settled = true;
                resolve(result);
            }
        };

        img.onload = () => done(true);
        img.onerror = () => done(false);

        // A timeout in case the request hangs
        setTimeout(() => done(false), 3000); 
        
        img.src = url;
    });
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
        if (await checkImageExists(url)) {
            if (DEBUG) console.log(`✅ Found poster via direct URL: ${url}`);
            return url;
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

    // Метод 4: Поиск в Kitsu.io
    try {
        const kitsuResponse = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}&page[limit]=1`);
        if (kitsuResponse.ok) {
            const kitsuData = await kitsuResponse.json();
            const posterUrl = kitsuData?.data?.[0]?.attributes?.posterImage?.original;
            if (posterUrl) {
                if (DEBUG) console.log(`✅ Found poster via Kitsu: ${posterUrl}`);
                return posterUrl;
            }
        }
    } catch (e) {
        if (DEBUG) console.log('Kitsu attempt failed:', e);
    }
    
    if (DEBUG) console.log(`❌ No alternative poster found for anime ${animeId}`);
    return null;
};