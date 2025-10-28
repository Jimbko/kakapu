import React, { useState, useEffect } from 'react';
import { ShikimoriAnime } from '../types';
import { getAnimeList, getAnimeById } from '../services/shikimori';
import { AnimeSection } from '../components/home/AnimeSection';
import { HeroBanner } from '../components/home/HeroBanner';
import { CommunityActivity } from '../components/home/CommunityActivity';
import { GenreExplorer } from '../components/home/GenreExplorer';
import { CallToAction } from '../components/home/CallToAction';

const DEBUG_MODE = process.env.NODE_ENV === 'development';

const logAnimeData = (section: string, data: ShikimoriAnime[] | ShikimoriAnime | null) => {
  if (!DEBUG_MODE) return;
  const animeList = Array.isArray(data) ? data : (data ? [data] : []);
  
  console.group(`📊 Data for section: ${section}`);
  if (animeList.length === 0) {
      console.log("No items found.");
  } else {
    console.log(`Total items: ${animeList.length}`);
    animeList.forEach((anime, idx) => {
      console.log(`[${idx}] ${anime.russian || anime.name}:`, {
        id: anime.id,
        hasImage: !!anime.image,
        imageUrl: anime.image?.original,
        imageObject: anime.image,
      });
    });
  }
  console.groupEnd();
};

const HomePage: React.FC = () => {
  const [heroAnime, setHeroAnime] = useState<ShikimoriAnime | null>(null);
  const [popularAnime, setPopularAnime] = useState<ShikimoriAnime[]>([]);
  const [newReleases, setNewReleases] = useState<ShikimoriAnime[]>([]);
  const [ongoingAnime, setOngoingAnime] = useState<ShikimoriAnime[]>([]);
  const [movies, setMovies] = useState<ShikimoriAnime[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    hero: true,
    popular: true,
    newReleases: true,
    ongoing: true,
    movies: true,
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({
    hero: null,
    popular: null,
    newReleases: null,
    ongoing: null,
    movies: null,
  });

  const loadHomePageData = async () => {
    // Reset states before fetching
    setLoadingStates({ hero: true, popular: true, newReleases: true, ongoing: true, movies: true });
    setErrors({ hero: null, popular: null, newReleases: null, ongoing: null, movies: null });

    // --- Hero Fetching ---
    const fetchHero = async () => {
        let validHeroFound = false;
        for (let attempt = 0; attempt < 5 && !validHeroFound; attempt++) {
            try {
                const randomPage = Math.floor(Math.random() * 5) + 1;
                const candidates = await getAnimeList({ limit: 1, order: 'popularity', page: randomPage });
                if (candidates && candidates.length > 0) {
                    const heroData = await getAnimeById(String(candidates[0].id));
                    if (heroData.image && (heroData.description_html || heroData.description)) {
                        setHeroAnime(heroData);
                        logAnimeData('Hero Banner', heroData);
                        validHeroFound = true;
                    }
                }
            } catch (e) { console.warn(`Hero fetch attempt ${attempt + 1} failed.`); }
        }
        if (!validHeroFound) setErrors(p => ({ ...p, hero: 'Не удалось загрузить баннер.' }));
        setLoadingStates(p => ({ ...p, hero: false }));
    };

    // --- Carousels Fetching ---
    const fetchSection = async (key: keyof typeof errors, fetchFn: () => Promise<ShikimoriAnime[]>) => {
        try {
            const data = await fetchFn();
            logAnimeData(key, data);
            if (key === 'popular') setPopularAnime(data);
            if (key === 'newReleases') setNewReleases(data);
            if (key === 'ongoing') setOngoingAnime(data);
            if (key === 'movies') setMovies(data);
        } catch (error) {
            setErrors(p => ({ ...p, [key]: `Не удалось загрузить секцию.` }));
        } finally {
            setLoadingStates(p => ({ ...p, [key]: false }));
        }
    };
    
    fetchHero();
    fetchSection('popular', () => getAnimeList({ limit: 12, order: 'popularity' }));
    fetchSection('newReleases', () => getAnimeList({ limit: 12, order: 'aired_on' }));
    fetchSection('ongoing', () => getAnimeList({ limit: 12, status: 'ongoing', order: 'popularity' }));
    fetchSection('movies', () => getAnimeList({ limit: 12, kind: 'movie', order: 'popularity' }));
  };

  useEffect(() => {
    loadHomePageData();
  }, []);

  return (
    <div className="space-y-16">
      <HeroBanner anime={heroAnime} loading={loadingStates.hero} error={errors.hero} onRetry={loadHomePageData} />
      
      <div className="space-y-12">
        <AnimeSection
          title="Популярное"
          animeList={popularAnime}
          loading={loadingStates.popular}
          error={errors.popular}
          viewAllLink="/list/order/popularity"
          onRetry={loadHomePageData}
        />
        <AnimeSection
          title="Онгоинги"
          animeList={ongoingAnime}
          loading={loadingStates.ongoing}
          error={errors.ongoing}
          viewAllLink="/list/status/ongoing"
          onRetry={loadHomePageData}
        />
        <AnimeSection
          title="Новинки"
          animeList={newReleases}
          loading={loadingStates.newReleases}
          error={errors.newReleases}
          viewAllLink="/list/order/aired_on"
          onRetry={loadHomePageData}
        />
      </div>

      <CommunityActivity />
      <GenreExplorer />

      <div className="space-y-12">
         <AnimeSection
            title="Фильмы"
            animeList={movies}
            loading={loadingStates.movies}
            error={errors.movies}
            viewAllLink="/list/kind/movie"
            onRetry={loadHomePageData}
          />
      </div>

      <CallToAction />
    </div>
  );
};

export default HomePage;