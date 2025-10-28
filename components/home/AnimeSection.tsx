import React from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../../types';
import { AnimeCard } from '../shared/AnimeCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

interface AnimeSectionProps {
  title: string;
  animeList: ShikimoriAnime[];
  loading?: boolean;
  error?: string | null;
  viewAllLink?: string;
  columns?: number;
  showRating?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}

export const AnimeSection: React.FC<AnimeSectionProps> = ({
  title,
  animeList,
  loading = false,
  error = null,
  viewAllLink,
  columns = 6,
  showRating = true,
  emptyMessage = 'Нет доступных аниме в этой категории.',
  onRetry,
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-${columns} gap-4`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-zinc-800 rounded mt-2 animate-pulse w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={onRetry} />;
    }

    if (!animeList || animeList.length === 0) {
      return <p className="text-zinc-500 text-center py-8">{emptyMessage}</p>;
    }

    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-${columns} gap-4`}>
        {animeList.map(anime => (
          <AnimeCard key={anime.id} anime={anime} showRating={showRating} />
        ))}
      </div>
    );
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Смотреть все →
          </Link>
        )}
      </div>
      {renderContent()}
    </section>
  );
};
