import React from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { ICONS } from '../constants';

// AnimeCard component
interface AnimeCardProps {
  anime: ShikimoriAnime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const imageUrl = anime.image?.preview || anime.image?.original;
  const score = parseFloat(anime.score);

  return (
    <Link to={`/anime/${anime.id}`} className="flex flex-col group fade-in">
      <div className="relative aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden transition-transform transform group-hover:scale-105">
        {imageUrl && !isPlaceholderUrl(imageUrl) ? (
          <img src={imageUrl} alt={anime.russian || anime.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <span>Нет фото</span>
          </div>
        )}
        {score > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold text-yellow-300 flex items-center space-x-1">
            {ICONS.STAR_FILLED}
            <span>{score.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <p className="line-clamp-2">{anime.russian || anime.name}</p>
        </div>
      </div>
      <h3 className="mt-2 text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
        {anime.russian || anime.name}
      </h3>
    </Link>
  );
};

// AnimeCarousel component
interface AnimeCarouselProps {
  title: string;
  animeList: ShikimoriAnime[];
  loading: boolean;
  listType?: string;
  listTitle?: string;
}

export const AnimeCarousel: React.FC<AnimeCarouselProps> = ({ title, animeList, loading, listType, listTitle }) => {
  const showSeeAll = listType && listTitle;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {showSeeAll && (
          <Link to={`/list/${listType}/${encodeURIComponent(listTitle!)}`} className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Смотреть все
          </Link>
        )}
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-40 md:w-48">
                <div className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded mt-2 animate-pulse w-3/4"></div>
              </div>
            ))
          : animeList.map(anime => (
              <div key={anime.id} className="flex-shrink-0 w-36 sm:w-40 md:w-48">
                <AnimeCard anime={anime} />
              </div>
            ))}
      </div>
    </section>
  );
};

const isPlaceholderUrl = (url: string | undefined | null): boolean => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    const badPatterns = [
        '/assets/globals/missing',
        '404',
        'not_found',
        'placeholder',
        'no_image',
    ];
    return badPatterns.some(pattern => lowerUrl.includes(pattern));
};
