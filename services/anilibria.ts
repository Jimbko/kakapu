import { ShikimoriAnime } from "../types";

const ANILIBRIA_API = 'https://api.anilibria.tv/v3';

export interface AnilibriaResult {
    id: number;
    names: {
        ru: string;
        en: string;
    };
    player: {
        episodes: {
            [key: string]: {
                hls: {
                    fhd?: string;
                    hd?: string;
                    sd?: string;
                };
            };
        };
    };
}

const searchAnilibria = async (title: string): Promise<AnilibriaResult | null> => {
    try {
        const response = await fetch(`${ANILIBRIA_API}/title/search?search=${encodeURIComponent(title)}&limit=1`);
        
        if (!response.ok) {
            console.error(`Anilibria API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.list && data.list.length > 0 ? data.list[0] : null;
    } catch (error) {
        console.error('Anilibria search failed:', error);
        return null;
    }
};

export const findAnilibriaPlayer = async (anime: ShikimoriAnime): Promise<AnilibriaResult | null> => {
    // 1. Поиск по русскому названию
    if (anime.russian) {
        console.log(`Anilibria: Поиск по русскому названию: "${anime.russian}"`);
        const result = await searchAnilibria(anime.russian);
        if (result) return result;
    }

    // 2. Поиск по оригинальному названию
    console.log(`Anilibria: Поиск по оригинальному названию: "${anime.name}"`);
    const result = await searchAnilibria(anime.name);
    if (result) return result;

    // 3. Поиск по английским названиям
    if (anime.english && anime.english.length > 0) {
        for (const title of anime.english) {
            if (title) {
                console.log(`Anilibria: Поиск по английскому названию: "${title}"`);
                const result = await searchAnilibria(title);
                if (result) return result;
            }
        }
    }

    console.log(`Anilibria: Плеер для аниме ID ${anime.id} не найден`);
    return null;
};
