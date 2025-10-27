import { ShikimoriAnime } from "../types";

const API_BASE = 'https://shikimori.one';

const fetchData = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'User-Agent': 'Anime-Volnitsa Catalog/1.0'
            }
        });
        if (!response.ok) {
            throw new Error(`Shikimori API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
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
        score?: number
    } = {}
): Promise<ShikimoriAnime[]> => {
    const params = new URLSearchParams({
        page: String(options.page || 1),
        limit: String(options.limit || 10),
        order: options.order || 'ranked',
    });
    if (options.kind) params.set('kind', options.kind);
    if (options.status) params.set('status', options.status);
    if (options.season) params.set('season', options.season);
    if (options.score) params.set('score', String(options.score));

    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
};

export const getAnimeById = (id: string): Promise<ShikimoriAnime> => {
    return fetchData<ShikimoriAnime>(`/api/animes/${id}`);
};

export const getAnimeByIds = (ids: number[]): Promise<ShikimoriAnime[]> => {
    if (ids.length === 0) return Promise.resolve([]);
    const params = new URLSearchParams({
        ids: ids.join(','),
        limit: String(ids.length)
    });
    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
}
