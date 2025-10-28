import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { ICONS } from '../constants';

const Top100Page: React.FC = () => {
  const [topAnime, setTopAnime] = useState<ShikimoriAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAnime = async () => {
      setLoading(true);
      try {
        const data = await getAnimeList({ limit: 100, order: 'ranked' });
        setTopAnime(data);
      } catch (error) {
        console.error("Failed to fetch top 100 anime:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopAnime();
  }, []);

  if (loading) {
      return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white mb-6">Топ-100 аниме</h1>
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-800 rounded-lg animate-pulse"></div>
            ))}
        </div>
      );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Топ-100 аниме</h1>
      <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
        {topAnime.map((anime, index) => (
          <Link 
            to={`/anime/${anime.id}`} 
            key={anime.id}
            className="flex items-center space-x-4 p-3 hover:bg-zinc-700/50 transition-colors border-b border-zinc-700/50 last:border-b-0"
          >
            <div className="text-xl font-bold text-zinc-400 w-8 text-center">{index + 1}</div>
            <img src={anime.image.x96} alt={anime.russian} className="w-16 h-24 object-cover rounded-md" />
            <div className="flex-grow">
              <h3 className="font-semibold text-white">{anime.russian || anime.name}</h3>
              <p className="text-sm text-zinc-400">{anime.name}</p>
              <div className="flex items-center space-x-4 text-xs text-zinc-400 mt-1">
                <span className="flex items-center space-x-1 font-bold text-yellow-400">
                    {ICONS.STAR_FILLED} <span>{anime.score}</span>
                </span>
                <span>{anime.kind?.toUpperCase()}</span>
                <span>{new Date(anime.aired_on).getFullYear()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Top100Page;