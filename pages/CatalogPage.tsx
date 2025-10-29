import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { AnimeCard } from '../components/shared/AnimeCard';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { AnimeCardSkeleton } from '../components/shared/skeletons/AnimeCardSkeleton';

// --- Child Component for displaying anime grid ---
const AnimeGrid: React.FC<{
    animeList: ShikimoriAnime[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
}> = ({ animeList, loading, hasMore, loadMore }) => {

    if (!loading && animeList.length === 0) {
        return (
            <div className="text-center py-16 bg-zinc-800/50 rounded-lg">
                <h2 className="text-xl font-semibold text-zinc-300">Ничего не найдено</h2>
                <p className="text-zinc-500 mt-2">Попробуйте изменить или сбросить фильтры.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {animeList.map(anime => (
                    <AnimeCard key={anime.id} anime={anime} />
                ))}
                {loading && Array.from({ length: 8 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
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
    );
};


// --- Main Page Component ---
const CatalogPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    const fetchAnime = useCallback(async (pageNum: number, clearList: boolean = false) => {
        setLoading(true);
        try {
            const year = searchParams.get('season_year');
            const seasonOfYear = searchParams.get('season_of_year');
            let seasonParam: string | undefined;

            if (year && seasonOfYear) {
                seasonParam = `${year}_${seasonOfYear}`;
            } else if (year) {
                seasonParam = year;
            }

            const params = {
                page: pageNum,
                limit: 20,
                order: searchParams.get('order') || 'ranked',
                kind: searchParams.get('kind') || undefined,
                status: searchParams.get('status') || undefined,
                season: seasonParam,
                genre: searchParams.get('genre') || undefined,
            };

            const data = await getAnimeList(params);
            setAnimeList(prev => clearList ? data : [...prev, ...data]);
            setHasMore(data.length === 20);
        } catch (error) {
            console.error("Failed to fetch catalog data:", error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        // Reset and fetch when filters change. Using fetchAnime as dependency
        // ensures this runs whenever searchParams (which fetchAnime depends on) changes.
        setPage(1);
        fetchAnime(1, true);
    }, [fetchAnime]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnime(nextPage, false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar />
            <div className="flex-grow">
                <AnimeGrid 
                    animeList={animeList}
                    loading={loading}
                    hasMore={hasMore}
                    loadMore={loadMore}
                />
            </div>
        </div>
    );
};

export default CatalogPage;
