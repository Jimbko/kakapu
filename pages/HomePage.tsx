import React, { useState, useEffect } from 'react';
import { ShikimoriAnime } from '../types';
import { getAnimeList } from '../services/shikimori';
import { AnimeCarousel } from '../components/AnimeComponents';

const HomePage: React.FC = () => {
  const [popular, setPopular] = useState<ShikimoriAnime[]>([]);
  const [ongoing, setOngoing] = useState<ShikimoriAnime[]>([]);
  const [newest, setNewest] = useState<ShikimoriAnime[]>([]);
  const [movies, setMovies] = useState<ShikimoriAnime[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAnime = async () => {
      try {
        setLoading(true);
        const [popularData, ongoingData, newestData, moviesData] = await Promise.all([
          getAnimeList({ limit: 10, order: 'ranked' }),
          getAnimeList({ limit: 10, status: 'ongoing', order: 'popularity' }),
          getAnimeList({ limit: 10, order: 'aired_on' }),
          getAnimeList({ limit: 10, kind: 'movie', order: 'popularity' })
        ]);
        
        // Revert: Remove filtering to show all content, even with placeholders.
        // This makes the homepage feel more complete.
        setPopular(popularData);
        setOngoing(ongoingData);
        setNewest(newestData);
        setMovies(moviesData);

      } catch (error) {
        console.error("Failed to fetch anime lists for homepage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnime();
  }, []);

  return (
    <div className="space-y-12">
      <AnimeCarousel title="Популярное" animeList={popular} loading={loading} listType="order" listTitle="ranked" />
      <AnimeCarousel title="Онгоинги" animeList={ongoing} loading={loading} listType="status" listTitle="ongoing" />
      <AnimeCarousel title="Новинки" animeList={newest} loading={loading} listType="order" listTitle="aired_on" />
      <AnimeCarousel title="Фильмы" animeList={movies} loading={loading} listType="kind" listTitle="movie" />
    </div>
  );
};

export default HomePage;