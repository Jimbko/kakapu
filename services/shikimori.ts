// FIX: Import ShikimoriImageObject from imageProcessor, not types.
import { ShikimoriAnime, Genre, FranchiseData, FranchiseNode, ProcessedImage } from '../types';
import { cache } from './cache';
// FIX: ShikimoriImageObject is defined and exported from imageProcessor.ts
import { selectBestPoster, tryAlternativePosterSources, ShikimoriImageObject, isPlaceholderUrl } from './imageProcessor';
import { makeUrlAbsolute } from '../utils/urlHelpers';

const SHIKIMORI_API_BASE = 'https://shikimori.one/api';
const USER_AGENT = 'AnimeVolnitsa/1.0 (https://github.com/your-repo/anime-volnitsa)'; // Placeholder URL
const CACHE_TTL_SHORT = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_LONG = 60 * 60 * 1000; // 1 hour

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic fetch function for the Shikimori API with caching and retry logic.
 */
const apiFetch = async <T>(endpoint: string, ttl: number = CACHE_TTL_SHORT): Promise<T> => {
    const url = `${SHIKIMORI_API_BASE}${endpoint}`;
    
    const cachedData = cache.get<T>(url);
    if (cachedData) {
        return cachedData;
    }

    const MAX_RETRIES = 4;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
            });

            if (response.ok) {
                const data = await response.json();
                cache.set(url, data, ttl);
                return data;
            }

            if (response.status === 429) {
                const delay = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s, 4s, 8s
                console.warn(`[Shikimori API] 429 Too Many Requests. Retrying in ${delay}ms... (Attempt ${attempt}/${MAX_RETRIES}) for ${url}`);
                await sleep(delay);
                continue; // Retry
            }

            // For other non-ok statuses, fail fast
            const responseText = await response.text();
            lastError = new Error(`[Shikimori API] Error ${response.status} for ${url}: ${responseText}`);
            break;

        } catch (error) {
            lastError = error as Error;
            console.error(`[Shikimori API] Network error on attempt ${attempt} for ${url}:`, error);
            if (attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 500;
                await sleep(delay);
            }
        }
    }
    
    console.error(lastError);
    throw lastError || new Error(`[Shikimori API] Request failed for ${url} after ${MAX_RETRIES} attempts.`);
};


/**
 * Processes a raw anime object from the API, primarily handling image selection from a single source.
 */
const processAnime = (anime: any): ShikimoriAnime => {
    const imageObj: ShikimoriImageObject | null = typeof anime.image === 'string'
        ? { original: anime.image, preview: anime.image, x96: anime.image, x48: anime.image }
        : anime.image;
        
    const { image, isPlaceholder } = selectBestPoster(imageObj, null);

    return {
        ...anime,
        image: isPlaceholder ? null : image,
    };
};

/**
 * Processes an array of raw anime objects.
 */
const processAnimeList = (animeList: any[]): ShikimoriAnime[] => {
    return animeList.filter(Boolean).map(processAnime);
};


/**
 * Fetches a list of anime based on provided parameters.
 */
export const getAnimeList = async (params: Record<string, any>): Promise<ShikimoriAnime[]> => {
    const filteredParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
            filteredParams[key] = String(value);
        }
    });
    const query = new URLSearchParams(filteredParams).toString();
    const data = await apiFetch<any[]>(`/animes?${query}`);
    return processAnimeList(data);
};

/**
 * Fetches detailed information for a single anime by its ID.
 */
export const getAnimeById = async (id: string): Promise<ShikimoriAnime> => {
    const data = await apiFetch<any>(`/animes/${id}`, CACHE_TTL_LONG);
    
    const detailImageObj = typeof data.image === 'string'
        ? { original: data.image, preview: data.image, x96: data.image, x48: data.image }
        : data.image;

    const { image, isPlaceholder } = selectBestPoster(detailImageObj, null);
    
    const processed = {
        ...data,
        image: isPlaceholder ? null : image,
    };

    // If poster is still missing, try alternative sources.
    if (!processed.image) {
        const alternativePosterUrl = await tryAlternativePosterSources(processed.id, processed.name);
        if (alternativePosterUrl) {
            processed.image = {
                original: alternativePosterUrl,
                preview: alternativePosterUrl,
                x96: alternativePosterUrl,
                x48: alternativePosterUrl,
            };
        }
    }
    
    return processed;
};

/**
 * Fetches basic information for multiple animes by their IDs in a single batch.
 */
export const getAnimeByIds = async (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return [];
    const query = `ids=${ids.join(',')}&limit=${ids.length}`;
    const data = await apiFetch<any[]>(`/animes?${query}`);
    return processAnimeList(data);
};

/**
 * An optimized function to enrich a list of anime with full details,
 * specifically targeting those with missing posters from list views.
 */
export const getFullAnimeDetailsByIds = async (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return [];

    // Step 1: Get the fast, batched data first.
    const batchedAnimeList = await getAnimeByIds(ids);

    // Step 2: Identify which animes are missing posters.
    const idsToEnrich = batchedAnimeList
        .filter(anime => !anime.image)
        .map(anime => anime.id);

    let enrichedData: ShikimoriAnime[] = [];
    if (idsToEnrich.length > 0) {
        console.log(`[Shikimori] Found ${idsToEnrich.length} animes with missing posters. Fetching full details.`);

        // Step 3: Fetch full details ONLY for the missing ones in parallel.
        const detailPromises = idsToEnrich.map(id => getAnimeById(String(id)));
        const results = await Promise.allSettled(detailPromises);

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                enrichedData.push(result.value);
            } else {
                console.warn(`[Shikimori] Failed to enrich anime ID ${idsToEnrich[index]}:`, result.reason);
            }
        });
    }

    // Step 4: Merge the results.
    const enrichedMap = new Map(enrichedData.map(anime => [anime.id, anime]));
    const finalAnimeList = batchedAnimeList.map(anime =>
        enrichedMap.get(anime.id) || anime
    );

    return finalAnimeList;
};


/**
 * Searches for anime based on a search term.
 */
export const searchAnime = async (term: string): Promise<ShikimoriAnime[]> => {
    const query = new URLSearchParams({ search: term, limit: '30' }).toString();
    const data = await apiFetch<any[]>(`/animes?${query}`);
    return processAnimeList(data);
};

/**
 * Fetches all available genres.
 */
export const getGenres = async (): Promise<Genre[]> => {
    return apiFetch<Genre[]>('/genres', CACHE_TTL_LONG * 24); // Genres change rarely
};

/**
 * Fetches a list of similar anime for a given anime ID.
 */
export const getSimilarAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const data = await apiFetch<any[]>(`/animes/${id}/similar`);
    return processAnimeList(data);
};

/**
 * Converts a FranchiseNode object to a partial ShikimoriAnime object.
 * This function is now more robust and directly creates a valid object.
 */
const franchiseNodeToAnime = (node: FranchiseNode): Partial<ShikimoriAnime> => {
    const absoluteUrl = makeUrlAbsolute(node.image_url);
    const hasImage = !isPlaceholderUrl(absoluteUrl);
    
    const image: ProcessedImage | null = hasImage ? {
        original: absoluteUrl,
        preview: absoluteUrl,
        x96: absoluteUrl,
        x48: absoluteUrl,
    } : null;

    return {
        id: node.id,
        name: node.name,
        russian: node.name,
        image: image,
        url: node.url,
        kind: node.kind as any,
        score: '0',
        aired_on: node.year ? `${node.year}-01-01` : new Date(node.date * 1000).toISOString(),
    };
};

/**
 * Fetches the franchise data for a given anime ID.
 */
export const getFranchiseAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const data = await apiFetch<FranchiseData>(`/animes/${id}/franchise`);
    if (!data?.nodes?.length) return [];
    
    // Directly map nodes to partial anime objects. This is safer than using processAnimeList
    // which expects a different data structure.
    return data.nodes
      .map(franchiseNodeToAnime)
      // We cast to ShikimoriAnime[] because we provide enough fields for display.
      .filter(Boolean) as ShikimoriAnime[];
};