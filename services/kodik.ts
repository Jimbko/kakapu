import { KodikSearchResult, ShikimoriAnime } from "../types";

/**
 * Обертка для поиска в Kodik, которая использует наш собственный API-роут.
 */
const searchKodik = async (params: { shikimori_id?: number; title?: string }): Promise<KodikSearchResult | null> => {
    try {
        const body: { shikimori_id?: number; title?: string } = {};
        if (params.shikimori_id) {
            body.shikimori_id = params.shikimori_id;
        }
        if (params.title) {
            body.title = params.title;
        }

        console.log(`🔍 Поиск в Kodik через локальный API:`, body);
        
        const response = await fetch('/api/kodik', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Local Kodik API endpoint error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        // API-роут возвращает полный ответ от Kodik
        return (data.results && data.results.length > 0) ? data.results[0] : null;
    } catch (error) {
        console.error('Kodik search through local API failed:', error);
        return null;
    }
};

/**
 * Основная функция для поиска плеера с многоступенчатой логикой.
 */
export const findKodikPlayer = async (anime: ShikimoriAnime): Promise<KodikSearchResult | null> => {
    // 1. Поиск по Shikimori ID (самый надежный)
    console.log(`Kodik: Поиск по shikimori_id ${anime.id}`);
    let result = await searchKodik({ shikimori_id: anime.id });
    if (result) return result;

    // 2. Фолбэк на русское название
    if (anime.russian) {
        console.log(`Kodik: Не найдено по shikimori_id. Ищу по названию: "${anime.russian}"`);
        result = await searchKodik({ title: anime.russian });
        if (result) return result;
    }

    // 3. Фолбэк на оригинальное название
    console.log(`Kodik: Не найдено по русскому названию. Ищу по оригинальному: "${anime.name}"`);
    result = await searchKodik({ title: anime.name });
    if (result) return result;
    
    // 4. Фолбэк на английские названия
    if (anime.english && anime.english.length > 0) {
        for (const title of anime.english) {
            if (title) {
                console.log(`Kodik: Не найдено по оригинальному. Ищу по английскому: "${title}"`);
                result = await searchKodik({ title: title });
                if (result) return result;
            }
        }
    }

    console.log(`Kodik: Плеер для аниме ID ${anime.id} не найден после всех попыток.`);
    return null;
};