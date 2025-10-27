import { KodikSearchResult, ShikimoriAnime } from "../types";

const PROXY_URL = 'https://cors.kurume.moe/';
const API_BASE = `${PROXY_URL}https://kodikapi.com`;
const API_TOKEN = '3f72e96c268b3c43694060851e331b2c';

const fetchData = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Kodik API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch from Kodik:", error);
        throw error;
    }
};

const searchKodik = async (params: URLSearchParams): Promise<KodikSearchResult | null> => {
    try {
        const data = await fetchData<{ results: KodikSearchResult[] }>(`/search?${params.toString()}`);
        return (data.results && data.results.length > 0) ? data.results[0] : null;
    } catch (error) {
        console.error(`Kodik search failed for params: ${params.toString()}`, error);
        return null;
    }
};

export const findKodikPlayer = async (anime: ShikimoriAnime): Promise<KodikSearchResult | null> => {
    // 1. Search by Shikimori ID (most reliable)
    console.log(`Kodik: Searching by shikimori_id ${anime.id}`);
    const paramsById = new URLSearchParams({ token: API_TOKEN, shikimori_id: String(anime.id) });
    let result = await searchKodik(paramsById);
    if (result) return result;

    // 2. Fallback to Russian title
    if (anime.russian) {
        console.log(`Kodik: No result for shikimori_id. Falling back to title search: "${anime.russian}"`);
        const paramsByRussianTitle = new URLSearchParams({ token: API_TOKEN, title: anime.russian });
        result = await searchKodik(paramsByRussianTitle);
        if (result) return result;
    }

    // 3. Fallback to Original title
    console.log(`Kodik: No result for russian title. Falling back to original title search: "${anime.name}"`);
    const paramsByOriginalTitle = new URLSearchParams({ token: API_TOKEN, title: anime.name });
    result = await searchKodik(paramsByOriginalTitle);
    if (result) return result;
    
    // 4. Fallback to English titles
    if (anime.english && anime.english.length > 0) {
        for (const title of anime.english) {
            if (title) {
                console.log(`Kodik: No result for original title. Falling back to english title search: "${title}"`);
                const paramsByEnglishTitle = new URLSearchParams({ token: API_TOKEN, title: title });
                result = await searchKodik(paramsByEnglishTitle);
                if (result) return result;
            }
        }
    }

    console.log(`Kodik: No results found for anime ID ${anime.id} after all fallbacks.`);
    return null;
};