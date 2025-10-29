import { KodikSearchResult, ShikimoriAnime } from "../types";

/**
 * Осуществляет поиск в API Kodik через прокси-сервер для обхода CORS.
 */
const searchKodikViaProxy = async (params: { shikimori_id?: number; title?: string }): Promise<KodikSearchResult | null> => {
    try {
        console.log(`🔍 Поиск в Kodik через прокси:`, params);

        // Запрос к нашему прокси-API
        const response = await fetch('/api/kodik', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            console.error(`Ошибка прокси Kodik: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return (data.results && data.results.length > 0) ? data.results[0] : null;

    } catch (error) {
        console.error('Поиск в Kodik через прокси не удался:', error);
        return null;
    }
};

/**
 * Основная функция для поиска плеера с многоступенчатой логикой.
 */
export const findKodikPlayer = async (anime: ShikimoriAnime): Promise<KodikSearchResult | null> => {
    // 1. Поиск по Shikimori ID (самый надежный)
    console.log(`Kodik: Поиск по shikimori_id ${anime.id}`);
    let result = await searchKodikViaProxy({ shikimori_id: anime.id });
    if (result) return result;

    // 2. Фолбэк на русское название
    if (anime.russian) {
        console.log(`Kodik: Не найдено по shikimori_id. Ищу по названию: "${anime.russian}"`);
        result = await searchKodikViaProxy({ title: anime.russian });
        if (result) return result;
    }

    // 3. Фолбэк на оригинальное название
    console.log(`Kodik: Не найдено по русскому названию. Ищу по оригинальному: "${anime.name}"`);
    result = await searchKodikViaProxy({ title: anime.name });
    if (result) return result;
    
    // 4. Фолбэк на английские названия
    if (anime.english && anime.english.length > 0) {
        for (const title of anime.english) {
            if (title) {
                console.log(`Kodik: Не найдено по оригинальному. Ищу по английскому: "${title}"`);
                result = await searchKodikViaProxy({ title: title });
                if (result) return result;
            }
        }
    }

    console.log(`Kodik: Плеер для аниме ID ${anime.id} не найден после всех попыток.`);
    return null;
};