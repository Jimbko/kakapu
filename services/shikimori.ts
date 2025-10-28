import { ShikimoriAnime, Genre, FranchiseData } from '../types';
import { cache } from './cache';
import { 
    selectBestPoster, 
    tryAlternativePosterSources,
    ShikimoriImageObject 
} from './imageProcessor';

const API_BASE = 'https://shikimori.one/api';
const USER_AGENT = 'AnimeVolnitsa/1.0';
const DEBUG_API = process.env.NODE_ENV === 'development';

// --- API Fetcher ---

const shikimoriApiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE}${endpoint}`;
    if (DEBUG_API) console.log(`[Shikimori API] Fetching: ${url}`);
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'User-Agent': USER_AGENT,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Shikimori API] Error ${response.status} for ${url}:`, errorText);
        throw new Error(`Shikimori API request failed with status ${response.status}`);
    }

    return response.json();
};

// --- Data Processing ---

const processAnimeData = async (animeData: any): Promise<ShikimoriAnime> => {
    // The main API returns a different image object shape than the IDs endpoint.
    // We can treat it as both for the poster selector.
    const detailImage: ShikimoriImageObject = animeData.image;
    
    let { image, isPlaceholder } = selectBestPoster(detailImage, null);

    // If no good image found, try alternative methods
    if (isPlaceholder) {
        if (DEBUG_API) console.log(`[Image Processor] No valid poster for ${animeData.id}, trying alternatives...`);
        const alternativeUrl = await tryAlternativePosterSources(animeData.id, animeData.russian || animeData.name);
        if (alternativeUrl) {
            image = {
                original: alternativeUrl,
                preview: alternativeUrl,
                x96: alternativeUrl,
                x48: alternativeUrl,
            };
        }
    }

    return { ...animeData, image };
};


// --- Exported Functions ---

export const getAnimeList = async (params: Record<string, any>): Promise<ShikimoriAnime[]> => {
    const filteredParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
            filteredParams[key] = String(value);
        }
    });

    const query = new URLSearchParams(filteredParams).toString();
    const cacheKey = `anime_list_${query}`;
    
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;
    
    const data = await shikimoriApiFetch<any[]>(`/animes?${query}`);
    const processedData = await Promise.all(data.map(processAnimeData));
    
    cache.set(cacheKey, processedData, 10 * 60 * 1000); // 10 minutes cache
    return processedData;
};

export const getAnimeById = async (id: string): Promise<ShikimoriAnime> => {
    const cacheKey = `anime_detail_${id}`;
    
    const cached = cache.get<ShikimoriAnime>(cacheKey);
    if (cached) return cached;

    // Fetch from both endpoints for better data quality
    const [detailData, listData] = await Promise.allSettled([
        shikimoriApiFetch<any>(`/animes/${id}`),
        shikimoriApiFetch<any[]>(`/animes?ids=${id}&limit=1`),
    ]);
    
    if (detailData.status === 'rejected') {
        throw new Error(`Failed to fetch main details for anime ${id}`);
    }

    const anime = detailData.value;
    const listVersion = listData.status === 'fulfilled' && listData.value[0] ? listData.value[0] : null;

    let { image, isPlaceholder } = selectBestPoster(anime.image, listVersion?.image);

    if (isPlaceholder) {
        if (DEBUG_API) console.log(`[Image Processor] No valid poster for ${id} from standard APIs, trying alternatives...`);
        const alternativeUrl = await tryAlternativePosterSources(anime.id, anime.russian || anime.name);
        if (alternativeUrl) {
            image = {
                original: alternativeUrl,
                preview: alternativeUrl,
                x96: alternativeUrl,
                x48: alternativeUrl,
            };
        }
    }
    
    const processedData: ShikimoriAnime = { ...anime, image };
    
    cache.set(cacheKey, processedData, 60 * 60 * 1000); // 1 hour cache
    return processedData;
};

export const getAnimeByIds = async (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return [];
    
    const idsString = ids.join(',');
    const cacheKey = `anime_by_ids_${idsString}`;
    
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;
    
    const data = await shikimoriApiFetch<any[]>(`/animes?ids=${idsString}&limit=${ids.length}`);
    const processedData = await Promise.all(data.map(processAnimeData));
    
    cache.set(cacheKey, processedData, 15 * 60 * 1000); // 15 minutes cache
    return processedData;
};

export const searchAnime = async (query: string): Promise<ShikimoriAnime[]> => {
    const data = await getAnimeList({ search: query, limit: 50 });
    return data;
};

export const getSimilarAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const cacheKey = `anime_similar_${id}`;
    
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const data = await shikimoriApiFetch<any[]>(`/animes/${id}/similar`);
    const processedData = await Promise.all(data.map(processAnimeData));

    cache.set(cacheKey, processedData, 6 * 60 * 60 * 1000); // 6 hours cache
    return processedData;
};

export const getFranchiseAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const cacheKey = `anime_franchise_${id}`;
    
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const franchiseData = await shikimoriApiFetch<FranchiseData>(`/animes/${id}/franchise`);
    const franchiseIds = franchiseData.nodes
        .filter(node => node.id !== franchiseData.current_id) // Exclude current anime
        .map(node => node.id);
        
    if (franchiseIds.length === 0) return [];
    
    const animeInFranchise = await getAnimeByIds(franchiseIds);

    cache.set(cacheKey, animeInFranchise, 6 * 60 * 60 * 1000); // 6 hours cache
    return animeInFranchise;
};

export const getGenres = async (): Promise<Genre[]> => {
    const cacheKey = 'genres';
    const cached = cache.get<Genre[]>(cacheKey);
    if (cached) return cached;

    const data = await shikimoriApiFetch<Genre[]>('/genres');
    cache.set(cacheKey, data); // No TTL, genres don't change often
    return data;
};