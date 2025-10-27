import React from 'react';
import { ICONS } from '../constants';
import { ShikimoriAnime } from '../types';

interface AnimeInfoProps {
    anime: ShikimoriAnime;
}

const stripHtml = (html: string | null) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export const AnimeInfo: React.FC<AnimeInfoProps> = ({ anime }) => {
    const description = stripHtml(anime.description_html) || 'Описание отсутствует.';

    return (
        <div className="bg-zinc-800/50 rounded-lg p-6 mt-4 fade-in">
            <h1 className="text-4xl font-bold text-white">{anime.russian || anime.name}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-zinc-400 mt-2 text-sm">
                <div className="flex items-center space-x-1 font-bold text-yellow-400">
                    {ICONS.STAR_FILLED}
                    <span>{anime.score}</span>
                </div>
                <span className="font-semibold">{anime.kind?.toUpperCase()}</span>
                <span className="capitalize">{anime.status.replace('_', ' ')}</span>
                <span>{new Date(anime.aired_on).getFullYear()}</span>
                 <span>{anime.episodes || '?'} эп.</span>
            </div>
            <p className="text-zinc-300 mt-4 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar pr-2">{description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {anime.genres.map(genre => (
                    <span key={genre.id} className="bg-zinc-700 text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-full">{genre.russian}</span>
                ))}
            </div>
             <div className="flex space-x-3 mt-6">
                <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-md font-semibold flex items-center space-x-2 transition-transform transform hover:scale-105">
                    {ICONS.HEART}
                    <span>В любимые</span>
                </button>
                <button className="bg-zinc-700 hover:bg-zinc-600 px-8 py-3 rounded-md font-semibold flex items-center space-x-2 transition-colors">
                    {ICONS.BOOKMARK}
                    <span>Смотреть позже</span>
                </button>
            </div>
        </div>
    );
};
