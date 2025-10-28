import React, { useState, useEffect } from 'react';
import { ShikimoriAnime } from '../types';
import { getAnimeList, getAnimeById } from '../services/shikimori';
import { AnimeCarousel } from '../components/AnimeComponents';
import { HeroBanner } from '../components/home/HeroBanner';
import { CommunityActivity } from '../components/home/CommunityActivity';
import { GenreExplorer } from '../components/home/GenreExplorer';
import { CallToAction } from '../components/home/CallToAction';
import { isPlaceholder } from '../services/imageService';

const HomePage: React.FC = () => {
  const [heroAnime, setHeroAnime] = useState<ShikimoriAnime | null>(null);
  const [popular, setPopular] = useState<ShikimoriAnime[]>([]);
  const [ongoing, setOngoing] = useState<ShikimoriAnime[]>([]);
  const [newest, setNewest] = useState<ShikimoriAnime[]>([]);
  const [movies, setMovies] = useState<ShikimoriAnime[]>([]);

  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
        setHeroLoading(true);
        let validHeroFound = false;
        const MAX_ATTEMPTS = 5;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS && !validHeroFound; attempt++) {
            try {
                const randomPage = Math.floor(Math.random() * 10) + 1;
                const candidates = await getAnimeList({ limit: 10, order: 'popularity', page: randomPage });
                
                if (!candidates || candidates.length === 0) continue;

                const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                
                const heroData = await getAnimeById(String(randomCandidate.id));

                if (heroData.image?.original && !isPlaceholder(heroData.image.original) && heroData.description_html) {
                    setHeroAnime(heroData);
                    validHeroFound = true;
                }
            } catch (error) {
                console.warn(`Failed to fetch hero on attempt ${attempt}:`, error);
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise(res => setTimeout(res, 200));
                }
            }
        }
        
        if (!validHeroFound) {
            console.error("Could not find a valid hero anime after all attempts.");
            setHeroAnime(null);
        }

        setHeroLoading(false);
    };

    const fetchCarousels = async () => {
      try {
        setLoading(true);
        const [popularData, ongoingData, newestData, moviesData] = await Promise.all([
          getAnimeList({ limit: 10, order: 'popularity' }),
          getAnimeList({ limit: 10, status: 'ongoing', order: 'popularity' }),
          getAnimeList({ limit: 10, order: 'aired_on' }),
          getAnimeList({ limit: 10, kind: 'movie', order: 'popularity' })
        ]);
        
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

    fetchHero();
    fetchCarousels();
  }, []);

  return (
    <div className="space-y-16">
      <HeroBanner anime={heroAnime} loading={heroLoading} />
      
      <div className="space-y-12">
        <AnimeCarousel title="Популярное" animeList={popular} loading={loading} listType="order" listTitle="popularity" />
        <AnimeCarousel title="Онгоинги" animeList={ongoing} loading={loading} listType="status" listTitle="ongoing" />
        <AnimeCarousel title="Новинки" animeList={newest} loading={loading} listType="order" listTitle="aired_on" />
      </div>

      <CommunityActivity />

      <GenreExplorer />

      <div className="space-y-12">
         <AnimeCarousel title="Фильмы" animeList={movies} loading={loading} listType="kind" listTitle="movie" />
      </div>

      <CallToAction />
    </div>
  );
};

export default HomePage;