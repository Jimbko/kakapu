import { KodikSearchResult, ShikimoriAnime } from "../types";

// Используем прокси, чтобы обойти CORS-ограничения браузера
const PROXY_URL = 'https://cors.kurume.moe/';
const KODIK_API_BASE = 'https://kodikapi.com';
const KODIK_INFO_BASE = 'https://kodik.info';

let cachedToken: string | null = null;

/**
 * Улучшенная функция для автоматического получения токена.
 * Сначала пытается найти токен на главной странице kodik.info,
 * затем в подключенных JS-скриптах, и только потом использует резервный.
 */
async function getKodikToken(): Promise<string> {
    if (cachedToken) {
        return cachedToken;
    }

    try {
        const response = await fetch(`${PROXY_URL}${KODIK_INFO_BASE}/`);
        const html = await response.text();
        
        const tokenMatch = html.match(/(?:token|api_token):\s*['"]([a-f0-9]{32})['"]/i);
        
        if (tokenMatch && tokenMatch[1]) {
            cachedToken = tokenMatch[1];
            console.log('✅ Токен Kodik успешно получен автоматически');
            return cachedToken;
        }

        const scriptMatches = html.match(/<script[^>]+src=["']([^"']+\.js)["']/gi);
        
        if (scriptMatches) {
            for (const scriptTag of scriptMatches.slice(0, 5)) { // Проверяем первые 5 скриптов
                const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
                if (srcMatch) {
                    let scriptUrl = srcMatch[1];
                    if (scriptUrl.startsWith('//')) {
                        scriptUrl = 'https:' + scriptUrl;
                    } else if (scriptUrl.startsWith('/')) {
                        scriptUrl = KODIK_INFO_BASE + scriptUrl;
                    }

                    try {
                        const scriptResponse = await fetch(`${PROXY_URL}${scriptUrl}`);
                        const scriptText = await scriptResponse.text();
                        const scriptTokenMatch = scriptText.match(/(?:token|api_token):\s*['"]([a-f0-9]{32})['"]/i);
                        
                        if (scriptTokenMatch && scriptTokenMatch[1]) {
                            cachedToken = scriptTokenMatch[1];
                            console.log('✅ Токен Kodik найден в скрипте');
                            return cachedToken;
                        }
                    } catch (e) {
                        // Игнорируем ошибки при загрузке отдельных скриптов
                        continue;
                    }
                }
            }
        }

        console.warn('⚠️ Не удалось получить токен автоматически, использую резервный');
        cachedToken = '3f72e96c268b3c43694060851e331b2c';
        return cachedToken;

    } catch (error) {
        console.error('❌ Ошибка при получении токена:', error);
        cachedToken = '3f72e96c268b3c43694060851e331b2c'; // Fallback token
        return cachedToken;
    }
}


/**
 * Обертка для поиска в Kodik, которая использует наш прокси и обработку токена.
 */
const searchKodik = async (params: { shikimori_id?: number; title?: string }): Promise<KodikSearchResult | null> => {
    try {
        const token = await getKodikToken();
        const searchParams = new URLSearchParams({ token });
        
        if (params.shikimori_id) {
            searchParams.set('shikimori_id', String(params.shikimori_id));
        } else if (params.title) {
            searchParams.set('title', params.title);
        } else {
            return null; // Нечего искать
        }
        
        console.log(`🔍 Поиск в Kodik: ${searchParams.toString()}`);
        
        const response = await fetch(`${PROXY_URL}${KODIK_API_BASE}/search?${searchParams.toString()}`, {
            method: 'POST', // Kodik API использует POST для поиска
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Kodik API returned error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return (data.results && data.results.length > 0) ? data.results[0] : null;
    } catch (error) {
        console.error('Kodik search failed:', error);
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
