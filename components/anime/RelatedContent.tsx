import React, { useState, useEffect } from 'react';
import { ShikimoriAnime } from '../../types';
import { getSimilarAnime, getFranchiseAnime } from '../../services/shikimori';
import { AnimeCarousel } from '../AnimeComponents';

interface RelatedContentProps {
    animeId: string;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({ animeId }) => {
    const [similar, setSimilar] = useState<ShikimoriAnime[]>([]);
    const [franchise, setFranchise] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!animeId) return;
            setLoading(true);
            try {
                const [similarData, franchiseData] = await Promise.all([
                    getSimilarAnime(animeId),
                    getFranchiseAnime(animeId)
                ]);
                setSimilar(similarData);
                setFranchise(franchiseData);
            } catch (error) {
                console.error("Failed to fetch related content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [animeId]);

    const hasSimilar = similar && similar.length > 0;
    const hasFranchise = franchise && franchise.length > 0;

    if (loading || (!hasSimilar && !hasFranchise)) {
        return null; // Don't render anything if loading or no related content found
    }

    return (
        <div className="space-y-12">
            {hasFranchise && (
                <AnimeCarousel
                    title="Вся франшиза"
                    animeList={franchise}
                    loading={loading}
                />
            )}
            {hasSimilar && (
                <AnimeCarousel
                    title="Похожие аниме"
                    animeList={similar}
                    loading={loading}
                />
            )}
        </div>
    );
};