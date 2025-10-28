import { ShikimoriAnime } from '../types';

const API_BASE = 'https://shikimori.one';
const PLACEHOLDER_SUBSTRING = '/assets/globals/missing_';

/**
 * Преобразует относительный URL изображения от Shikimori в абсолютный.
 */
const makeUrlAbsolute = (relativeUrl: string | undefined | null): string => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl; // Уже абсолютный
    return `${API_BASE}${relativeUrl}`;
};

/**
 * Проверяет, является ли URL изображения плейсхолдером.
 */
export const isPlaceholder = (url: string | undefined | null): boolean => {
    return !!url && url.includes(PLACEHOLDER_SUBSTRING);
};

/**
 * Обрабатывает объект 'image' из аниме, заменяя плейсхолдеры на скриншоты,
 * если это возможно, и делая все URL абсолютными.
 * @param anime - Полный объект аниме от Shikimori
 * @returns - Обработанный объект image с наилучшими доступными URL
 */
export const processAnimeImages = (anime: ShikimoriAnime): ShikimoriAnime['image'] => {
    const processedImage = { ...anime.image };
    const firstScreenshot = anime.screenshots?.[0];

    // Фолбэк на скриншоты, если основной постер - плейсхолдер.
    // Это сработает, только если в объекте anime есть поле screenshots,
    // которого нет в ответах API для списков.
    if (isPlaceholder(processedImage.original) && firstScreenshot?.original) {
        processedImage.original = firstScreenshot.original;
        processedImage.preview = firstScreenshot.preview;
        processedImage.x96 = firstScreenshot.preview;
        processedImage.x48 = firstScreenshot.preview;
    }

    // Делаем все URL абсолютными
    processedImage.original = makeUrlAbsolute(processedImage.original);
    processedImage.preview = makeUrlAbsolute(processedImage.preview);
    processedImage.x96 = makeUrlAbsolute(processedImage.x96);
    processedImage.x48 = makeUrlAbsolute(processedImage.x48);

    return processedImage;
};

/**
 * Обрабатывает массив скриншотов, делая их URL абсолютными.
 */
export const processScreenshots = (screenshots: ShikimoriAnime['screenshots'] | undefined): ShikimoriAnime['screenshots'] => {
    if (!screenshots) return [];
    return screenshots.map(s => ({
        original: makeUrlAbsolute(s.original),
        preview: makeUrlAbsolute(s.preview),
    }));
};
