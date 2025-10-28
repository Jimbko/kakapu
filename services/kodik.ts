import { KodikSearchResult, ShikimoriAnime } from "../types";

const KODIK_API_BASE = 'https://kodikapi.com';
// Используем надежный резервный токен, так как получение нового на клиенте невозможно из-за CORS
const KODIK_TOKEN = '3f72e96c268b3c43694060851e331b2c';

/**
 * Осуществляет прямой поиск в API Kodik с клиента.
 */
const searchKodikDirectly = async (params: { shikimori_id?: number; title?: string }): Promise<KodikSearchResult | null> => {
    try {
        const urlParams = new URLSearchParams({ token: KODIK_TOKEN });
        if (params.shikimori_id) {
            urlParams.set('shikimori_id', String(params.shikimori_id));
        } else if (params.title) {
            urlParams.set('title', params.title);
        }

        console.log(`🔍 Прямой поиск в Kodik:`, params);

        const response = await fetch(`${KODIK_API_BASE}/search`, {
            method: 'POST',
            headers: {
                // Kodik API требует этот Content-Type для POST запросов
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlParams.toString(),
        });

        if (!response.ok) {
            console.error(`Kodik API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return (data.results && data.results.length > 0) ? data.results[0] : null;

    } catch (error) {
        console.error('Прямой поиск в Kodik не удался:', error);
        return null;
    }
};

/**
 * Основная функция для поиска плеера с многоступенчатой логикой.
 */
export const findKodikPlayer = async (anime: ShikimoriAnime): Promise<KodikSearchResult | null> => {
    // 1. Поиск по Shikimori ID (самый надежный)
    console.log(`Kodik: Поиск по shikimori_id ${anime.id}`);
    let result = await searchKodikDirectly({ shikimori_id: anime.id });
    if (result) return result;

    // 2. Фолбэк на русское название
    if (anime.russian) {
        console.log(`Kodik: Не найдено по shikimori_id. Ищу по названию: "${anime.russian}"`);
        result = await searchKodikDirectly({ title: anime.russian });
        if (result) return result;
    }

    // 3. Фолбэк на оригинальное название
    console.log(`Kodik: Не найдено по русскому названию. Ищу по оригинальному: "${anime.name}"`);
    result = await searchKodikDirectly({ title: anime.name });
    if (result) return result;
    
    // 4. Фолбэк на английские названия
    if (anime.english && anime.english.length > 0) {
        for (const title of anime.english) {
            if (title) {
                console.log(`Kodik: Не найдено по оригинальному. Ищу по английскому: "${title}"`);
                result = await searchKodikDirectly({ title: title });
                if (result) return result;
            }
        }
    }

    console.log(`Kodik: Плеер для аниме ID ${anime.id} не найден после всех попыток.`);
    return null;
};
