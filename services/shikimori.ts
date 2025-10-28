import { ShikimoriAnime, Genre } from "../types";
import { processAnimeImages, processScreenshots, isPlaceholder } from './imageService';

const API_BASE = 'https://shikimori.one';

/**
 * Centralized processor for anime data. It uses the imageService
 * to provide unified processing for images and screenshots.
 * @param anime The raw anime object from the API.
 * @returns A processed anime object with absolute image URLs and best-effort poster replacement.
 */
const processAnimeData = (anime: ShikimoriAnime): ShikimoriAnime => {
    // Deep copy to avoid mutating the original data from caches or other sources.
    const processedAnime = JSON.parse(JSON.stringify(anime));

    // Delegate image and screenshot processing to the dedicated imageService.
    processedAnime.image = processAnimeImages(anime);
    processedAnime.screenshots = processScreenshots(anime.screenshots);
    
    return processedAnime;
};

/**
 * Generic fetch wrapper for the Shikimori API.
 * @param endpoint The API endpoint to fetch (e.g., '/api/animes/1').
 * @param process A boolean to indicate if the data should be processed by processAnimeData.
 * @returns The fetched and optionally processed data.
 */
const fetchData = async <T>(endpoint: string, process: boolean = true): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Shikimori API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        // Skip processing if explicitly told not to (e.g., for genres).
        if (!process) {
            return data;
        }

        // Apply the centralized processor to the fetched data.
        if (Array.isArray(data)) {
            // Handle lists of anime.
            return data.map(item => processAnimeData(item as ShikimoriAnime)) as T;
        } else if (data && typeof data === 'object' && 'id' in data && 'kind' in data) {
            // Handle a single anime object.
            return processAnimeData(data as ShikimoriAnime) as T;
        }

        return data;

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

    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
};

export const getAnimeById = async (id: string): Promise<ShikimoriAnime> => {
    // Step 1: Fetch raw anime data.
    const anime = await fetchData<ShikimoriAnime>(`/api/animes/${id}`, false);

    const absolutePosterUrl = anime.image.original.startsWith('http')
        ? anime.image.original
        : `${API_BASE}${anime.image.original}`;
    
    // Step 2: If the poster is a placeholder, attempt fallbacks.
    if (isPlaceholder(absolutePosterUrl)) {
        console.log(`Placeholder detected for anime ${id}. Attempting fallbacks.`);
        
        let hasResolved = false;

        // Fallback 1: Fetch screenshots. This is for animes that genuinely lack a poster but have visuals.
        try {
            const screenshots = await fetchData<ShikimoriAnime['screenshots']>(`/api/animes/${id}/screenshots`, false);
            if (screenshots && screenshots.length > 0) {
                console.log(`Found ${screenshots.length} screenshots. Augmenting anime data.`);
                anime.screenshots = screenshots;
                hasResolved = true; // The image service will now have data to replace the placeholder
            }
        } catch (error) {
            console.warn(`Could not fetch separate screenshots for anime ${id}:`, error);
        }

        // Fallback 2: Re-fetch via list endpoint if screenshots didn't exist or were empty.
        // This handles cases where a valid poster exists but the API served a stale link from cache.
        if (!hasResolved) {
            try {
                console.log(`No screenshots found. Re-fetching anime data via list endpoint to find a non-stale poster.`);
                const animeListResponse = await fetchData<ShikimoriAnime[]>(`/api/animes?ids=${id}&limit=1`, false);
                if (animeListResponse && animeListResponse.length > 0) {
                    const refreshedAnime = animeListResponse[0];
                    const refreshedPosterUrl = refreshedAnime.image.original.startsWith('http') 
                        ? refreshedAnime.image.original 
                        : `${API_BASE}${refreshedAnime.image.original}`;

                    // If the new URL is not a placeholder, we've found the real poster.
                    if (!isPlaceholder(refreshedPosterUrl)) {
                        console.log(`Successfully fetched updated poster URL. Overwriting stale image data.`);
                        anime.image = refreshedAnime.image;
                    }
                }
            } catch (error) {
                console.warn(`Could not re-fetch anime data for ${id}:`, error);
            }
        }
    }
    
    // Step 3: Run the centralized processor on the final (potentially augmented/updated) anime object.
    return processAnimeData(anime);
};

export const getAnimeByIds = (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return Promise.resolve([]);
    const params = new URLSearchParams({
        ids: ids.join(','),
        limit: String(ids.length)
    });
    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
}

export const searchAnime = (query: string, limit: number = 20): Promise<ShikimoriAnime[]> => {
    const params = new URLSearchParams({
        search: query,
        limit: String(limit),
        kind: 'tv,movie,ova,ona,special,music'
    });
    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
};

export const getGenres = (): Promise<Genre[]> => {
    // Genres do not need processing as they don't contain images.
    return fetchData<Genre[]>('/api/genres', false);
};