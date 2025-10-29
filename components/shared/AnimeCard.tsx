import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden relative">
        {imageUrl ? (
          <img
            key={imageUrl} // Force re-render on URL change
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder />
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