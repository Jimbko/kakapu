import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { VideoPlayer } from './components/VideoPlayer';
import { AnimeInfo } from './components/AnimeComponents';
import { CommentSection } from './components/CommunityComponents';
import { ICONS } from './constants';
import { ShikimoriAnime } from './types';
import { getAnimeList, getAnimeById } from './services/shikimori';
import { getPlayerLink } from './services/kodik';

const Header: React.FC = () => (
  <header className="bg-zinc-800/50 backdrop-blur-sm sticky top-0 z-50 border-b border-zinc-800">
    <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2">
            {ICONS.LOGO}
            <span className="font-bold text-lg hidden sm:inline">Anime-Volnitsa</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-zinc-300 hover:text-purple-400 transition-colors">Главная</Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
            <input type="text" placeholder="Найти аниме..." className="bg-zinc-700/50 rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none w-40 sm:w-64 transition-all"/>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{ICONS.SEARCH}</div>
        </div>
        <img src="https://i.pravatar.cc/40?u=dragger1337" alt="User Avatar" className="w-9 h-9 rounded-full cursor-pointer" />
      </div>
    </nav>
  </header>
);

const AnimeCard: React.FC<{ anime: ShikimoriAnime }> = ({ anime }) => (
    <Link to={`/anime/${anime.id}`} className="block group fade-in">
        <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative shadow-lg">
            <img src={`https://shikimori.one${anime.image.original}`} alt={anime.russian} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-md">
                {ICONS.STAR_FILLED}
                <span>{anime.score}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <h3 className="absolute bottom-2 left-2 right-2 text-sm text-white font-semibold truncate group-hover:text-purple-300 transition-colors">{anime.russian || anime.name}</h3>
        </div>
    </Link>
);


const AnimeCarousel: React.FC<{ title: string; animes: ShikimoriAnime[] }> = ({ title, animes }) => (
    <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5">
            {animes.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
        </div>
    </section>
);

const HomePage: React.FC = () => {
    const [ongoing, setOngoing] = useState<ShikimoriAnime[]>([]);
    const [released, setReleased] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [ongoingData, releasedData] = await Promise.all([
                getAnimeList('ongoing', 14),
                getAnimeList('released', 14)
            ]);
            setOngoing(ongoingData);
            setReleased(releasedData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-96"><div className="text-xl font-semibold">Загрузка аниме...</div></div>;

    return (
        <div className="fade-in">
            <AnimeCarousel title="Онгоинги сезона" animes={ongoing} />
            <AnimeCarousel title="Популярное" animes={released} />
        </div>
    );
};

const AnimePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [anime, setAnime] = useState<ShikimoriAnime | null>(null);
    const [playerUrl, setPlayerUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setAnime(null);
            setPlayerUrl(null);
            
            const animeData = await getAnimeById(id);
            if (animeData) {
                setAnime(animeData);
                const kodikLink = await getPlayerLink(animeData.id.toString());
                setPlayerUrl(kodikLink);
            }
            setLoading(false);
        };

        window.scrollTo(0, 0);
        fetchData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-96"><div className="text-xl font-semibold">Загрузка...</div></div>;
    if (!anime) return <div className="text-center p-16 text-red-500">Не удалось загрузить информацию об аниме.</div>;
    
    return (
        <div className="fade-in">
             <div className="max-w-5xl mx-auto">
                <VideoPlayer playerUrl={playerUrl} />
                <AnimeInfo anime={anime} />
                <div className="mt-8">
                    <CommentSection episodeId={"1"} />
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/anime/:id" element={<AnimePage />} />
                </Routes>
            </main>
        </div>
    </HashRouter>
  );
};

export default App;
