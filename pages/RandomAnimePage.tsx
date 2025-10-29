import React, { useEffect, useState } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { useNavigate } = ReactRouterDom;
import { getAnimeList } from '../services/shikimori';

const RandomAnimePage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Подбираем для вас что-то интересное...');

  useEffect(() => {
    const findRandomAnime = async () => {
      try {
        // Fetch a list of popular anime to get a decent random choice
        const randomPage = Math.floor(Math.random() * 50) + 1; // get from first 50 pages
        const animeList = await getAnimeList({ order: 'ranked', page: randomPage, limit: 50 });
        if (animeList.length > 0) {
          const randomIndex = Math.floor(Math.random() * animeList.length);
          const randomAnime = animeList[randomIndex];
          setMessage(`Перенаправляем на страницу: ${randomAnime.russian || randomAnime.name}`);
          setTimeout(() => {
            navigate(`/anime/${randomAnime.id}`);
          }, 1000);
        } else {
          setMessage('Не удалось найти случайное аниме. Перенаправляем на главную...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error("Failed to fetch random anime:", error);
        setMessage('Произошла ошибка. Перенаправляем на главную...');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    findRandomAnime();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-xl text-zinc-300">{message}</p>
        <div className="mt-4 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default RandomAnimePage;