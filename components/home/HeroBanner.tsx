import React from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../../types';
import { ICONS } from '../../constants';
import { ErrorMessage } from '../shared/ErrorMessage';

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
    const bannerContainerClasses = "h-[50vh] w-full rounded-2xl flex items-center justify-center -mt-8";

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
    const backgroundImageUrl = anime.screenshots && anime.screenshots.length > 0
        ? anime.screenshots[0].original
        : anime.image?.original;
        
    const content = (
        <div className="relative z-10 text-white max-w-2xl fade-in">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{anime.russian}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-zinc-300 mt-2 text-sm">
                <div className="flex items-center space-x-1 font-bold text-yellow-400">
                    {ICONS.STAR_FILLED}
                    <span>{anime.score}</span>
                </div>
                <span>{anime.kind?.toUpperCase()}</span>
                <span>{new Date(anime.aired_on).getFullYear()}</span>
                <span>{anime.episodes || '?'} эп.</span>
            </div>
            <p className="mt-4 text-sm text-zinc-300 leading-relaxed line-clamp-3">
                {description || 'Описание отсутствует.'}
            </p>
            <Link 
                to={`/anime/${anime.id}`}
                className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
                Подробнее
            </Link>
        </div>
    );

    if (!backgroundImageUrl) {
        // Fallback UI when image is missing but data is present
        return (
            <div 
                className="h-[50vh] w-full rounded-2xl flex items-end p-8 relative overflow-hidden -mt-8"
                style={{ background: 'linear-gradient(to top, rgba(18, 18, 20, 1), rgba(34, 35, 40, 0.7)), linear-gradient(to right, rgba(18, 18, 20, 0.9), transparent 70%)' }}
            >
                {content}
            </div>
        );
    }

    return (
        <div 
            className="h-[50vh] w-full rounded-2xl bg-cover bg-center flex items-end p-8 relative overflow-hidden -mt-8"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            {content}
        </div>
    );
};