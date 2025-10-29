import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { AnimeCard } from '../components/shared/AnimeCard';
import { AnimeCardSkeleton } from '../components/shared/skeletons/AnimeCardSkeleton';

const ListPage: React.FC = () => {
    const { type, title } = useParams<{ type: string; title: string }>();
    const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const decodedTitle = title ? decodeURIComponent(title) : '';
    const pageTitle = decodedTitle.charAt(0).toUpperCase() + decodedTitle.slice(1);

    const fetchAnime = async (pageNum: number) => {
        if (!type || !title) return;
        setLoading(true);
        try {
            const options: any = { page: pageNum, limit: 20 };
            options[type] = decodedTitle;

            const data = await getAnimeList(options);
            setAnimeList(prev => pageNum === 1 ? data : [...prev, ...data]);
            setHasMore(data.length === 20);
        } catch (error) {
            console.error("Failed to fetch list page data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAnimeList([]);
        setPage(1);
        setHasMore(true);
        fetchAnime(1);
    }, [type, title]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnime(nextPage);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Аниме: {pageTitle}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {animeList.map(anime => (
                    <AnimeCard key={anime.id} anime={anime} />
                ))}
                {loading && Array.from({ length: 12 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                ))}
            </div>
            {hasMore && !loading && (
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

export default ListPage;