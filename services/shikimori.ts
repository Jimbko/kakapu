import { ShikimoriAnime, Genre } from "../types";
import { processAnimeImages, processScreenshots } from './imageService';

const API_BASE = 'https://shikimori.one';

/**
 * Централизованный обработчик данных аниме. Использует imageService для
 * унифицированной обработки изображений и скриншотов.
 */
const processAnimeData = (anime: ShikimoriAnime): ShikimoriAnime => {
    // Глубокое копирование, чтобы избежать мутаций исходных данных
    const processedAnime = JSON.parse(JSON.stringify(anime));

    // Делегируем обработку изображений и скриншотов в imageService
    processedAnime.image = processAnimeImages(anime);
    processedAnime.screenshots = processScreenshots(anime.screenshots);
    
    return processedAnime;
};


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
        
        if (!process) {
            return data;
        }

        // Применяем обработчик к полученным данным
        if (Array.isArray(data)) {
            return data.map(item => processAnimeData(item as ShikimoriAnime)) as T;
        } else if (data && typeof data === 'object' && 'id' in data) {
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

export const searchAnime = (query: string, limit: number = 20): Promise<ShikimoriAnime[]> => {
    const params = new URLSearchParams({
        search: query,
        limit: String(limit),
        kind: 'tv,movie,ova,ona,special,music'
    });
    return fetchData<ShikimoriAnime[]>(`/api/animes?${params.toString()}`);
};

export const getGenres = (): Promise<Genre[]> => {
    // Жанры не нужно обрабатывать, так как у них нет изображений
    return fetchData<Genre[]>('/api/genres', false);
};
