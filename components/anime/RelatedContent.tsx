import React, { useState, useEffect } from 'react';
import { ShikimoriAnime } from '../../types';
import { getSimilarAnime, getFranchiseAnime } from '../../services/shikimori';
import { AnimeSection } from '../home/AnimeSection';

interface RelatedContentProps {
    animeId: string;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({ animeId }) => {
    const [similar, setSimilar] = useState<ShikimoriAnime[]>([]);
    const [franchise, setFranchise] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRelated = async () => {
        if (!animeId) return;
        setLoading(true);
        setError(null);
        try {
            const [similarData, franchiseData] = await Promise.all([
                getSimilarAnime(animeId),
                getFranchiseAnime(animeId)
            ]);
            setSimilar(similarData);
            setFranchise(franchiseData);
        } catch (err) {
            console.error("Failed to fetch related content:", err);
            setError("Не удалось загрузить связанный контент.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelated();
    }, [animeId]);

    const hasSimilar = similar && similar.length > 0;
    const hasFranchise = franchise && franchise.length > 0;

    if (loading || (!hasSimilar && !hasFranchise && !error)) {
       // Don't render skeleton here, just wait
       return null;
    }

    if (error && !hasSimilar && !hasFranchise) {
        return null; // or show a small error message if desired
    }


    return (
        <div className="space-y-12">
            {hasFranchise && (
                <AnimeSection
                    title="Вся франшиза"
                    animeList={franchise}
                    loading={loading}
                    error={error}
                    onRetry={fetchRelated}
                />
            )}
            {hasSimilar && (
                <AnimeSection
                    title="Похожие аниме"
                    animeList={similar}
                    loading={loading}
                    error={error}
                    onRetry={fetchRelated}
                />
            )}
        </div>
    );
};
