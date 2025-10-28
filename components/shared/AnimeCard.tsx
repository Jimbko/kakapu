import React from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../../types';
import { ICONS } from '../../constants';
import { memo } from 'react';

interface PosterPlaceholderProps {
  title: string;
}

const PosterPlaceholder: React.FC<PosterPlaceholderProps> = ({ title }) => (
  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center text-white font-bold text-center p-2">
    <span className="text-4xl sm:text-5xl md:text-6xl mb-2 drop-shadow-lg">
      {title?.[0]?.toUpperCase() || '?'}
    </span>
    <span className="text-xs sm:text-sm opacity-80">Нет постера</span>
  </div>
);

interface AnimeCardProps {
  anime: ShikimoriAnime;
  showRating?: boolean;
}

const AnimeCardComponent: React.FC<AnimeCardProps> = ({ anime, showRating = true }) => {
  const imageUrl = anime.image?.original;
  const score = parseFloat(anime.score);
  const title = anime.russian || anime.name;

  return (
    <Link to={`/anime/${anime.id}`} className="flex flex-col group fade-in" aria-label={title}>
      <article className="relative aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden transition-transform transform group-hover:scale-105 shadow-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Постер аниме ${title}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <PosterPlaceholder title={title} />
        )}

        {showRating && score > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold text-yellow-300 flex items-center space-x-1">
            {ICONS.STAR_FILLED}
            <span>{score.toFixed(1)}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <p className="line-clamp-2 leading-tight">{title}</p>
        </div>
      </article>
      
      <h3 className="mt-2 text-sm text-zinc-300 group-hover:text-white transition-colors truncate" title={title}>
        {title}
      </h3>
    </Link>
  );
};

export const AnimeCard = memo(AnimeCardComponent);
