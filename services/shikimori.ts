import { ShikimoriAnime, Genre } from "../types";
import { processAnimeImages, processScreenshots, isPlaceholder, makeUrlAbsolute } from './imageService';
import { cache } from './cache';

const API_BASE = 'https://shikimori.one';

// A robust, promise-based request queue to prevent rate-limiting (429 errors).
// This serializes all concurrent requests and ensures a minimum interval between them.
let requestQueue = Promise.resolve();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 2 requests per second is a safe limit

const throttle = () => {
    requestQueue = requestQueue.then(() => {
        return new Promise<void>(resolve => {
            const now = Date.now();
            const timeSinceLast = now - lastRequestTime;
            const delay = timeSinceLast < MIN_REQUEST_INTERVAL
                ? MIN_REQUEST_INTERVAL - timeSinceLast
                : 0;

            setTimeout(() => {
                lastRequestTime = Date.now();
                resolve();
            }, delay);
        });
    });
    return requestQueue;
};

const processAnimeData = (anime: ShikimoriAnime): ShikimoriAnime => {
    const processedAnime = JSON.parse(JSON.stringify(anime));
    processedAnime.image = processAnimeImages(processedAnime);
    processedAnime.screenshots = processScreenshots(processedAnime.screenshots);
    return processedAnime;
};

const fetchData = async <T>(
    endpoint: string, 
    options: { process?: boolean; cacheKey?: string; cacheTTL?: number } = {}
): Promise<T> => {
    const { process = true, cacheKey, cacheTTL } = options;

    if (cacheKey) {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
            // Data in cache is now pre-processed, so we can return it directly.
            // console.log(`[Cache] HIT for key: ${cacheKey}`);
            return cachedData;
        }
        // console.log(`[Cache] MISS for key: ${cacheKey}`);
    }

    await throttle();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
        });
        if (!response.ok) {
            throw new Error(`Shikimori API error: ${response.status} ${response.statusText}`);
        }
        const rawData = await response.json();
        
        if (!process) {
            // If processing is disabled, we still cache the raw data and return it.
            // This is used by getAnimeById which does its own processing.
            if (cacheKey) {
                cache.set(cacheKey, rawData, cacheTTL);
            }
            return rawData;
        }

        // Process the data *before* caching.
        let processedData;
        if (Array.isArray(rawData)) {
            processedData = rawData.map(item => processAnimeData(item as ShikimoriAnime)) as T;
        } else if (rawData && typeof rawData === 'object' && 'id' in rawData && 'kind' in rawData) {
            processedData = processAnimeData(rawData as ShikimoriAnime) as T;
        } else {
            processedData = rawData;
        }
        
        // Cache the *processed* data.
        if (cacheKey && processedData) {
            cache.set(cacheKey, processedData, cacheTTL);
        }

        return processedData;

    } catch (error) {
        console.error("Failed to fetch from Shikimori:", error);
        throw error;
    }
};

export const getAnimeList = (
    options: {
        page?: number,
        limit?: number,
        order?: string,
        kind?: string,
        status?: string,
        season?: string,
        score?: number,
        genre?: string,
    } = {}
): Promise<ShikimoriAnime[]> => {
    const params = new URLSearchParams({
        page: String(options.page || 1),
        limit: String(options.limit || 20),
        order: options.order || 'ranked',
    });
    if (options.kind) params.set('kind', options.kind);
    if (options.status) params.set('status', options.status);
    if (options.season) params.set('season', options.season);
    if (options.score) params.set('score', String(options.score));
    if (options.genre) params.set('genre', options.genre);

    const cacheKey = `anime_list_${params.toString()}`;
    const cacheTTL = 15 * 60 * 1000; // 15 minutes

    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`, { cacheKey, cacheTTL });
};

export const getAnimeById = async (id: string): Promise<ShikimoriAnime> => {
    const cacheKey = `anime_by_id_${id}`;
    const cacheTTL = 60 * 60 * 1000; // 1 hour

    const cachedData = cache.get<ShikimoriAnime>(cacheKey);
    if (cachedData) {
        // console.log(`[Cache] HIT for anime ID: ${id}`);
        return cachedData;
    }

    // Fetch raw data without processing first to check for placeholder
    const anime = await fetchData<ShikimoriAnime>(`/api/animes/${id}`, { process: false });
    const absolutePosterUrl = anime.image?.original ? makeUrlAbsolute(anime.image.original) : '';
    
    if (isPlaceholder(absolutePosterUrl)) {
        console.log(`Placeholder detected for anime ${id}. Attempting fallback.`);
        try {
            const animeListResponse = await fetchData<ShikimoriAnime[]>(`/api/animes?ids=${id}&limit=1`, { process: false });
            if (animeListResponse && animeListResponse.length > 0) {
                const refreshedAnime = animeListResponse[0];
                if (refreshedAnime.image && !isPlaceholder(makeUrlAbsolute(refreshedAnime.image.original))) {
                    console.log(`Successfully fetched updated poster for ${id}.`);
                    anime.image = refreshedAnime.image;
                }
            }
        } catch (error) {
            console.warn(`Could not re-fetch anime data for ${id}:`, error);
        }
    }
    
    const processedAnime = processAnimeData(anime);
    cache.set(cacheKey, processedAnime, cacheTTL);
    return processedAnime;
};

export const getAnimeByIds = (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return Promise.resolve([]);
    const params = new URLSearchParams({
        ids: ids.join(','),
        limit: String(ids.length)
    });
    
    const cacheKey = `anime_by_ids_${ids.join(',')}`;
    const cacheTTL = 60 * 60 * 1000; // 1 hour

    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`, { cacheKey, cacheTTL });
}

export const searchAnime = (query: string, limit: number = 20): Promise<ShikimoriAnime[]> => {
    const params = new URLSearchParams({
        search: query,
        limit: String(limit),
        kind: 'tv,movie,ova,ona,special,music'
    });
    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`, { process: true, cacheKey: `search_${query}`, cacheTTL: 5 * 60 * 1000 });
};

export const getGenres = (): Promise<Genre[]> => {
    const cacheKey = 'genres_list';
    const cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
    return fetchData<Genre[]>('/api/genres', { process: false, cacheKey, cacheTTL });
};