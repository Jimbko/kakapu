import React from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ShikimoriAnime } from '../../types';
import { ICONS } from '../../constants';
import { ErrorMessage } from '../shared/ErrorMessage';
import { makeUrlAbsolute } from '../../utils/urlHelpers';

interface HeroBannerProps {
    anime: ShikimoriAnime | null;
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
}

const stripHtml = (html: string | null) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ anime, loading, error, onRetry }) => {
    const bannerContainerClasses = "h-[55vh] md:h-[65vh] w-full rounded-2xl flex items-center justify-center -mt-8";

    if (loading) {
        return (
            <div className={`${bannerContainerClasses} bg-zinc-800 animate-pulse`}>
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
             <div className={`${bannerContainerClasses} bg-zinc-800`}>
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        )
    }

    if (!anime) {
        return null;
    }

    const description = stripHtml(anime.description_html);
    
    const rawBackgroundImageUrl = anime.screenshots && anime.screenshots.length > 0
        ? anime.screenshots[0].original
        : anime.image?.original;
        
    const backgroundImageUrl = makeUrlAbsolute(rawBackgroundImageUrl);
        
    const content = (
        <div className="relative z-10 text-white max-w-2xl fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{anime.russian}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-zinc-200 mt-3 text-sm md:text-base drop-shadow-md">
                <div className="flex items-center space-x-1 font-bold text-yellow-400">
                    <div className="w-5 h-5">{ICONS.STAR_FILLED}</div>
                    <span>{anime.score}</span>
                </div>
                <span>{anime.kind?.toUpperCase()}</span>
                <span>{new Date(anime.aired_on).getFullYear()}</span>
                <span>{anime.episodes || '?'} эп.</span>
            </div>
            <p className="mt-4 text-sm md:text-base text-zinc-200 leading-relaxed line-clamp-3 drop-shadow-md">
                {description || 'Описание отсутствует.'}
            </p>
            <Link 
                to={`/anime/${anime.id}`}
                className="mt-8 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                Подробнее
            </Link>
        </div>
    );

    const containerBaseClasses = "h-[55vh] md:h-[65vh] w-full rounded-2xl flex items-center justify-start p-8 sm:p-12 lg:p-16 relative overflow-hidden -mt-8 bg-zinc-800";

    if (!backgroundImageUrl) {
        // Fallback UI when image is missing but data is present
        return (
            <div className={containerBaseClasses}>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black/70"></div>
                {content}
            </div>
        );
    }

    return (
        <div 
            className={`${containerBaseClasses} bg-cover bg-center`}
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            {content}
        </div>
    );
};
