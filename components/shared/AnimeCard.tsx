import React, { useEffect, useState } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ShikimoriAnime } from '../../types';
import { ICONS } from '../../constants';
import { usePosters } from '../../contexts/PosterContext';
import { ImagePlaceholder } from './ImagePlaceholder';

interface AnimeCardProps {
  anime: ShikimoriAnime;
  showRating?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, showRating = true }) => {
  const { posters, requestPoster } = usePosters();
  
  const [currentAnime, setCurrentAnime] = useState(posters.get(anime.id) || anime);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const updatedAnime = posters.get(anime.id);
    if (updatedAnime) {
      setCurrentAnime(updatedAnime);
    }
  }, [posters, anime.id]);
  
  useEffect(() => {
    if (!anime.image) {
      requestPoster(anime.id);
    }
  }, [anime.id, anime.image, requestPoster]);

  const imageUrl = currentAnime.image?.preview;
  const title = currentAnime.russian || currentAnime.name;
  const score = parseFloat(currentAnime.score);

  return (
    <Link to={`/anime/${currentAnime.id}`} className="group block">
      <div className="aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden relative transition-transform duration-300 group-hover:scale-105">
        {imageUrl ? (
          <img
            key={imageUrl} // Force re-render on URL change
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder />
        )}
        
        {/* Improved Hover Rating Display */}
        {showRating && score > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0">
            <div className="flex items-center justify-center space-x-1 text-yellow-300 font-bold">
              <div className="w-4 h-4">{ICONS.STAR_FILLED}</div>
              <span>{score.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors truncate" title={title}>
        {title}
      </h3>
    </Link>
  );
};
