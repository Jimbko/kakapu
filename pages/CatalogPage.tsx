import React, { useState, useEffect, useCallback } from 'react';
// FIX: Populating the CatalogPage component which was previously empty.
import * as ReactRouterDom from 'react-router-dom';
const { useSearchParams } = ReactRouterDom;
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { AnimeListItem } from '../components/catalog/AnimeListItem';
import { AnimeListItemSkeleton } from '../components/shared/skeletons/AnimeListItemSkeleton';
import { ICONS } from '../constants';

const CatalogPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnime = useCallback(async (pageNum: number, params: URLSearchParams) => {
        setLoading(true);
        setError(null);
        try {
            const options: any = { page: pageNum, limit: 20 };
            params.forEach((value, key) => {
                options[key] = value;
            });

            // Make sure order is set if not present for better results
            if (!options.order) {
                options.order = 'popularity';
            }

            const data = await getAnimeList(options);
            setAnimeList(prev => pageNum === 1 ? data : [...prev, ...data]);
            setHasMore(data.length === 20);
        } catch (err) {
            console.error("Failed to fetch catalog data:", err);
            setError("Не удалось загрузить список аниме. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setAnimeList([]);
        setPage(1);
        setHasMore(true);
        fetchAnime(1, searchParams);
    }, [searchParams, fetchAnime]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnime(nextPage, searchParams);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar />
            <div className="flex-grow">
                <h1 className="text-3xl font-bold text-white mb-6">Каталог аниме</h1>
                <div className="space-y-3">
                    {page === 1 && loading && Array.from({ length: 10 }).map((_, i) => (
                        <AnimeListItemSkeleton key={i} />
                    ))}
                    {!loading && animeList.length === 0 && (
                         <div className="text-center py-16 bg-zinc-800/50 rounded-lg">
                            <div className="text-5xl text-purple-400 mb-4 h-12 w-12 mx-auto">{ICONS.SEARCH}</div>
                            <h2 className="text-xl font-semibold text-zinc-300">Ничего не найдено</h2>
                            <p className="text-zinc-500 mt-2">Попробуйте изменить или сбросить фильтры.</p>
                        </div>
                    )}
                    {error && <div className="text-center text-red-400">{error}</div>}
                    {animeList.map(anime => (
                        <AnimeListItem key={anime.id} anime={anime} />
                    ))}
                    {page > 1 && loading && Array.from({ length: 5 }).map((_, i) => (
                        <AnimeListItemSkeleton key={`loader-${i}`} />
                    ))}
                </div>
                {hasMore && !loading && animeList.length > 0 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={loadMore}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors"
                        >
                            Загрузить еще
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;
