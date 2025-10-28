import React from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../../types';
import { ICONS } from '../../constants';

interface AnimeCardProps {
  anime: ShikimoriAnime;
  showRating?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, showRating = true }) => {
  const title = anime.russian || anime.name;
  const score = parseFloat(anime.score);

  return (
    <Link to={`/anime/${anime.id}`} className="group block">
      <div className="aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden relative">
        {anime.image ? (
          <img
            src={anime.image.preview}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-500 text-sm">Нет постера</span>
          </div>
        )}
        
        {showRating && score > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-yellow-300 flex items-center space-x-1">
            {ICONS.STAR_FILLED}
            <span>{score.toFixed(1)}</span>
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors truncate" title={title}>
        {title}
      </h3>
    </Link>
  );
};
