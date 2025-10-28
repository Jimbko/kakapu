import { ShikimoriAnime, Genre, FranchiseData, FranchiseNode } from "../types";
import { cache } from './cache';
import { selectBestPoster, DEBUG_IMAGES, tryAlternativePosterSources } from './imageProcessor';
import { makeUrlAbsolute } from "../utils/urlHelpers";

const API_BASE = 'https://shikimori.one';

// Rate limiting
let requestQueue = Promise.resolve();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500;

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

const fetchData = async <T>(endpoint: string): Promise<T> => {
    await throttle();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Shikimori API error: ${response.status} for ${endpoint}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
};

// Simplified processor for lists where only one source is available
const processAnimeFromList = (rawAnime: any): ShikimoriAnime => {
    const posterResult = selectBestPoster(rawAnime.image, null);
    
    return {
        ...rawAnime,
        image: posterResult.image,
        screenshots: (rawAnime.screenshots || []).map((s: any) => ({
            original: makeUrlAbsolute(s.original),
            preview: makeUrlAbsolute(s.preview),
        })),
    };
};


export const getAnimeList = async (options: {
    page?: number,
    limit?: number,
    order?: string,
    kind?: string,
    status?: string,
    season?: string,
    score?: number,
    genre?: string,
} = {}): Promise<ShikimoriAnime[]> => {
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
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const animeList = await fetchData<any[]>(`/api/animes?${params.toString()}`);
    const processed = animeList.map(processAnimeFromList);
    
    cache.set(cacheKey, processed, 15 * 60 * 1000);
    return processed;
};

export const getAnimeById = async (id: string): Promise<ShikimoriAnime> => {
    const cacheKey = `anime_by_id_${id}`;
    const cached = cache.get<ShikimoriAnime>(cacheKey);
    if (cached) return cached;

    console.log(`📥 Fetching anime ${id} from multiple sources...`);

    const [detailResult, listResult] = await Promise.allSettled([
        fetchData<any>(`/api/animes/${id}`),
        fetchData<any[]>(`/api/animes?ids=${id}&limit=1`),
    ]);

    if (detailResult.status === 'rejected' && listResult.status === 'rejected') {
        console.error(`❌ Failed to fetch anime ${id} from all sources.`);
        throw new Error(`Failed to fetch anime ${id}`);
    }

    const animeDetail = detailResult.status === 'fulfilled' ? detailResult.value : null;
    const animeList = listResult.status === 'fulfilled' ? listResult.value : null;
    const listVersion = animeList?.[0] || null;

    const baseAnimeData = animeDetail || listVersion;
    if (!baseAnimeData) {
        throw new Error(`Could not retrieve base data for anime ${id}`);
    }
    
    const posterResult = selectBestPoster(animeDetail?.image, listVersion?.image);

    // Try alternative sources before giving up
    if (posterResult.image === null || posterResult.isPlaceholder) {
        console.log(`🔄 Trying alternative poster sources for anime ${id}...`);
        const alternativePoster = await tryAlternativePosterSources(
            Number(id), 
            baseAnimeData.name || baseAnimeData.russian
        );
        
        if (alternativePoster) {
            posterResult.image = {
                original: alternativePoster,
                preview: alternativePoster,
                x96: alternativePoster,
                x48: alternativePoster,
            };
            posterResult.isPlaceholder = false;
            posterResult.sourceInfo = { endpoint: 'alternative', size: 'original', url: alternativePoster };
            console.log(`✅ Successfully found alternative poster for ${id}`);
        }
    }


    if (DEBUG_IMAGES) {
      console.group(`[Image Debug] Anime ${id}: ${baseAnimeData.name}`);
      console.log(`  Detail Endpoint Image:`, animeDetail?.image);
      console.log(`  List Endpoint Image:`, listVersion?.image);
      console.log(`  Selected Source:`, posterResult.sourceInfo);
      console.log(`  Final Image Object:`, posterResult.image);
      console.log(`  Is Placeholder:`, posterResult.isPlaceholder);
      console.groupEnd();
    }
    
    const finalAnime: ShikimoriAnime = {
        ...baseAnimeData,
        image: posterResult.image,
        screenshots: (baseAnimeData.screenshots || []).map((s: any) => ({
            original: makeUrlAbsolute(s.original),
            preview: makeUrlAbsolute(s.preview),
        })),
    };

    const cacheTTL = posterResult.isPlaceholder 
        ? 5 * 60 * 1000 // 5 minutes for items without a poster
        : 60 * 60 * 1000; // 1 hour for items with a poster

    cache.set(cacheKey, finalAnime, cacheTTL);
    return finalAnime;
};

export const getAnimeByIds = async (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return [];
    
    const cacheKey = `anime_by_ids_${ids.join(',')}`;
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        ids: ids.join(','),
        limit: String(ids.length)
    });

    const animeList = await fetchData<any[]>(`/api/animes?${params.toString()}`);
    const processed = animeList.map(processAnimeFromList);
    
    cache.set(cacheKey, processed, 60 * 60 * 1000);
    return processed;
};

export const searchAnime = async (query: string, limit: number = 20): Promise<ShikimoriAnime[]> => {
    const cacheKey = `search_${query}_${limit}`;
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        search: query,
        limit: String(limit),
        kind: 'tv,movie,ova,ona,special,music'
    });

    const animeList = await fetchData<any[]>(`/api/animes?${params.toString()}`);
    const processed = animeList.map(processAnimeFromList);
    
    cache.set(cacheKey, processed, 5 * 60 * 1000);
    return processed;
};

export const getGenres = async (): Promise<Genre[]> => {
    const cacheKey = 'genres_list';
    const cached = cache.get<Genre[]>(cacheKey);
    if (cached) return cached;

    const genres = await fetchData<Genre[]>('/api/genres');
    cache.set(cacheKey, genres, 24 * 60 * 60 * 1000);
    return genres;
};

export const getSimilarAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const cacheKey = `similar_anime_${id}`;
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;

    const similarList = await fetchData<any[]>(`/api/animes/${id}/similar`);
    const processed = similarList.map(processAnimeFromList);
    
    cache.set(cacheKey, processed, 60 * 60 * 1000);
    return processed;
};

export const getFranchiseAnime = async (id: string): Promise<ShikimoriAnime[]> => {
    const cacheKey = `franchise_anime_${id}`;
    const cached = cache.get<ShikimoriAnime[]>(cacheKey);
    if (cached) return cached;
    
    const franchiseData = await fetchData<FranchiseData>(`/api/animes/${id}/franchise`);

    if (!franchiseData || !franchiseData.nodes) {
        return [];
    }
    
    const sortedNodes = franchiseData.nodes.sort((a, b) => a.weight - b.weight);

    const mappedAnime: ShikimoriAnime[] = sortedNodes.map((node: FranchiseNode) => {
        const posterResult = selectBestPoster({ original: node.image_url, preview: node.image_url }, null);

        return {
            id: node.id,
            name: node.name,
            russian: node.name,
            image: posterResult.image,
            score: '0.0',
            url: node.url,
            kind: node.kind as any,
            aired_on: node.year ? `${node.year}-01-01` : new Date(node.date * 1000).toISOString(),
            status: 'released',
            episodes: 0,
            episodes_aired: 0,
            released_on: null,
            rating: '',
            english: [],
            japanese: [],
            synonyms: [],
            license_name_ru: null,
            duration: 0,
            description: null,
            description_html: null,
            description_source: null,
            franchise: null,
            favoured: false,
            anons: false,
            ongoing: false,
            thread_id: 0,
            topic_id: 0,
            myanimelist_id: 0,
            rates_scores_stats: [],
            rates_statuses_stats: [],
            updated_at: '',
            next_episode_at: null,
            genres: [],
            studios: [],
            videos: [],
            screenshots: [],
            user_rate: null,
        }
    });
    
    cache.set(cacheKey, mappedAnime, 60 * 60 * 1000);
    return mappedAnime;
};