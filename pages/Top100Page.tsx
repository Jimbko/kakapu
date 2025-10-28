import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { ICONS } from '../constants';

const TopAnimeCard: React.FC<{ anime: ShikimoriAnime; rank: number }> = ({ anime, rank }) => {
    
    const imageUrl = anime.image?.preview || anime.image?.x96;

    return (
        <Link to={`/anime/${anime.id}`} className="flex items-start space-x-4 bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/60 transition-colors duration-200">
            <span className="text-3xl font-black text-zinc-500 w-12 text-center flex-shrink-0">{rank}</span>
            {imageUrl ? (
                <img src={imageUrl} alt={anime.russian} className="w-16 h-24 object-cover rounded-md flex-shrink-0" />
            ) : (
                <div className="w-16 h-24 bg-zinc-700 rounded-md flex-shrink-0 flex items-center justify-center text-zinc-500 text-xs">Нет фото</div>
            )}
            <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-white hover:text-purple-400 transition-colors truncate">{anime.russian || anime.name}</h3>
                <div className="text-sm text-zinc-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{anime.kind?.toUpperCase()}</span>
                    <span>{new Date(anime.aired_on).getFullYear()}</span>
                    <div className="flex items-center space-x-1 font-bold text-yellow-400">
                        {ICONS.STAR_FILLED}
                        <span>{anime.score}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const Top100Page: React.FC = () => {
    const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTop100 = async () => {
            setLoading(true);
            try {
                // Shikimori API returns max 50 items per page, so we fetch two pages in parallel.
                const [page1, page2] = await Promise.all([
                    getAnimeList({ limit: 50, order: 'ranked', page: 1 }),
                    getAnimeList({ limit: 50, order: 'ranked', page: 2 })
                ]);
                setAnimeList([...page1, ...page2]);
            } catch (error) {
                console.error("Failed to fetch top 100 anime:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTop100();
    }, []);

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-white mb-6">Топ 100 аниме</h1>
                <div className="space-y-4">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 bg-zinc-800/50 p-4 rounded-lg animate-pulse">
                            <div className="h-8 w-12 bg-zinc-700 rounded-md"></div>
                            <div className="w-16 h-24 bg-zinc-700 rounded-md"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-5 bg-zinc-700 rounded w-3/4"></div>
                                <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Топ 100 аниме</h1>
            <div className="space-y-4">
                {animeList.map((anime, index) => (
                    <TopAnimeCard key={anime.id} anime={anime} rank={index + 1} />
                ))}
            </div>
        </div>
    );
};

export default Top100Page;