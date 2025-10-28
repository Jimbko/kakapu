import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShikimoriAnime, KodikSearchResult } from '../types';
import { getAnimeById } from '../services/shikimori';
import { findKodikPlayer } from '../services/kodik';
import { AnimeInfo } from '../components/AnimeComponents';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../components/CommunityComponents';

const AnimePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<ShikimoriAnime | null>(null);
  const [kodikData, setKodikData] = useState<KodikSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect for fetching main anime data
  useEffect(() => {
    if (!id) return;

    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shikimoriData = await getAnimeById(id);
        setAnime(shikimoriData);

      } catch (err) {
        setError("Не удалось загрузить данные об аниме. Попробуйте обновить страницу.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  // Effect for fetching player data, runs after anime data is loaded
  useEffect(() => {
    if (!anime) return;

    const fetchPlayerData = async () => {
      setPlayerLoading(true);
      const kodikResult = await findKodikPlayer(anime);
      setKodikData(kodikResult);
      setPlayerLoading(false);
    };

    fetchPlayerData();
  }, [anime]);


  if (loading) {
    return (
      <div className="text-center p-10">
        <p className="text-lg text-zinc-400">Загрузка данных об аниме...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-900/20 border border-red-500 rounded-lg">
        <p className="text-lg text-red-400">{error}</p>
      </div>
    );
  }
  
  if (!anime) {
      return <div className="text-center p-10">Аниме не найдено.</div>
  }

  return (
    <div>
      <div 
        className="h-[40vh] md:h-[50vh] -mx-4 -mt-8 mb-8 bg-cover bg-center relative" 
        style={{ backgroundImage: `url(https://shikimori.one${anime.image.original})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent"></div>
      </div>

      <AnimeInfo anime={anime} />
      
      <div className="mt-12">
        <VideoPlayer kodikData={kodikData} loading={playerLoading} />
      </div>

      <div className="mt-12">
        <CommentSection episodeId={`${id}-ep1`} />
      </div>

    </div>
  );
};

export default AnimePage;