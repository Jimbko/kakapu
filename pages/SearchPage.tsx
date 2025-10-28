import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { searchAnime } from '../services/shikimori';
import { AnimeCard } from '../components/AnimeComponents';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    
    const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!query) {
            setAnimeList([]);
            setLoading(false);
            return;
        };

        const performSearch = async () => {
            setLoading(true);
            try {
                const results = await searchAnime(query);
                setAnimeList(results);
            } catch (error) {
                console.error("Failed to perform search:", error);
                setAnimeList([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">
                Результаты поиска по запросу: <span className="text-purple-400">"{query}"</span>
            </h1>

            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0">
                            <div className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"></div>
                            <div className="h-4 bg-zinc-800 rounded mt-2 animate-pulse w-3/4"></div>
                        </div>
                    ))}
                </div>
            )}
            
            {!loading && animeList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {animeList.map(anime => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            )}

            {!loading && animeList.length === 0 && (
                <div className="text-center py-16 bg-zinc-800/50 rounded-lg">
                    <h2 className="text-xl font-semibold text-zinc-300">Ничего не найдено</h2>
                    <p className="text-zinc-500 mt-2">Попробуйте изменить ваш поисковый запрос.</p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;