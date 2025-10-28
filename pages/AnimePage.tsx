import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShikimoriAnime, KodikSearchResult, SimpleAnime } from '../types';
import { getAnimeById } from '../services/shikimori';
import { findKodikPlayer } from '../services/kodik';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../components/CommunityComponents';
import { RelatedContent } from '../components/anime/RelatedContent';
import { ICONS } from '../constants';
import { useAuth, StatusListKey } from '../contexts/AuthContext';


const AnimeActions: React.FC<{ anime: ShikimoriAnime }> = ({ anime }) => {
    const { currentUser, openLoginModal, isInList, addToList, removeFromList, getAnimeStatus, setAnimeStatus, addToast, userLists } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    const simpleAnime: SimpleAnime = { id: anime.id, name: anime.name };
    const currentStatus = getAnimeStatus(anime.id);

    useEffect(() => {
        if (currentUser) {
            setIsFavorite(isInList('favorite', anime.id));
        } else {
            setIsFavorite(false);
        }
    }, [currentUser, isInList, anime.id, userLists]);

    const handleFavoriteClick = () => {
        if (!currentUser) { openLoginModal(); return; }
        if (isFavorite) {
            removeFromList('favorite', anime.id);
            addToast(`"${anime.russian || anime.name}" удалено из любимого`, 'info');
        } else {
            addToList('favorite', simpleAnime);
            addToast(`"${anime.russian || anime.name}" добавлено в любимое`, 'success');
        }
        setIsFavorite(!isFavorite);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!currentUser) { openLoginModal(); return; }
        const newStatus = e.target.value as StatusListKey | 'none';
        const statusMap: Record<StatusListKey, string> = {
            'watching': 'Смотрю',
            'planned': 'Запланировано',
            'completed': 'Просмотрено',
            'dropped': 'Брошено',
        };

        if (newStatus === 'none') {
            setAnimeStatus(simpleAnime, null);
            addToast(`Статус для "${anime.russian || anime.name}" убран`, 'info');
        } else {
            setAnimeStatus(simpleAnime, newStatus);
            addToast(`Статус для "${anime.russian || anime.name}" изменен на "${statusMap[newStatus]}"`, 'success');
        }
    };
    
    const statusOptions = [
        { value: 'none', label: 'Добавить в список' },
        { value: 'watching', label: 'Смотрю' },
        { value: 'planned', label: 'Запланировано' },
        { value: 'completed', label: 'Просмотрено' },
        { value: 'dropped', label: 'Брошено' },
    ];

    return (
        <div className="flex items-center space-x-2">
            <select
                value={currentStatus || 'none'}
                onChange={handleStatusChange}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md appearance-none text-sm transition-colors"
            >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button
                onClick={handleFavoriteClick}
                className={`p-2.5 rounded-md transition-colors ${
                    isFavorite
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
            >
                {ICONS.HEART}
            </button>
        </div>
    );
};


const AnimeHeader: React.FC<{ anime: ShikimoriAnime }> = ({ anime }) => {
    const description = (new DOMParser().parseFromString(anime.description_html || '', 'text/html')).body.textContent || "";
    const score = parseFloat(anime.score);
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                <img
                    src={anime.image?.original}
                    alt={anime.russian || anime.name}
                    className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg"
                />
            </div>
            <div className="md:w-2/3 lg:w-3/4 text-white">
                <span className="text-sm text-zinc-400 font-medium">{new Date(anime.aired_on).getFullYear()} · {anime.kind?.toUpperCase()} · {anime.status}</span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">{anime.russian || anime.name}</h1>
                <h2 className="text-lg text-zinc-300 font-medium mt-1">{anime.name}</h2>
                {score > 0 && (
                     <div className="flex items-center space-x-2 mt-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold border-4 border-yellow-400 text-yellow-300">
                           {score.toFixed(1)}
                        </div>
                        <div>
                            <p className="font-semibold">Рейтинг Shikimori</p>
                            <p className="text-xs text-zinc-400">На основе {anime.rates_scores_stats.reduce((acc, s) => acc + s.value, 0)} оценок</p>
                        </div>
                    </div>
                )}
                <div className="mt-6">
                    <AnimeActions anime={anime} />
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Описание</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-5">{description || 'Описание отсутствует.'}</p>
                </div>
            </div>
        </div>
    );
};

const AnimeDetails: React.FC<{ anime: ShikimoriAnime }> = ({ anime }) => {
    return (
        <div className="mt-8 bg-zinc-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-white">Детали</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-zinc-400">Тип:</span><br /><span className="text-zinc-200 font-medium">{anime.kind?.toUpperCase() || '?'}</span></div>
                <div><span className="text-zinc-400">Эпизоды:</span><br /><span className="text-zinc-200 font-medium">{anime.episodes || '?'}</span></div>
                <div><span className="text-zinc-400">Статус:</span><br /><span className="text-zinc-200 font-medium">{anime.status || '?'}</span></div>
                <div><span className="text-zinc-400">Рейтинг:</span><br /><span className="text-zinc-200 font-medium">{anime.rating?.toUpperCase() || '?'}</span></div>
                <div><span className="text-zinc-400">Студии:</span><br /><span className="text-zinc-200 font-medium">{anime.studios.map(s => s.name).join(', ') || '?'}</span></div>
                <div className="col-span-2 md:col-span-3"><span className="text-zinc-400">Жанры:</span><br /><span className="text-zinc-200 font-medium">{anime.genres.map(g => g.russian).join(', ') || '?'}</span></div>
            </div>
        </div>
    );
};

const AnimePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [anime, setAnime] = useState<ShikimoriAnime | null>(null);
    const [kodikData, setKodikData] = useState<KodikSearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [playerLoading, setPlayerLoading] = useState(true);
    const { userLists } = useAuth(); // Depend on userLists to re-render actions

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setPlayerLoading(true);
            setAnime(null);
            setKodikData(null);
            
            try {
                const animeData = await getAnimeById(id);
                setAnime(animeData);

                const player = await findKodikPlayer(animeData);
                setKodikData(player);

            } catch (error) {
                console.error("Failed to fetch anime data:", error);
            } finally {
                setLoading(false);
                setPlayerLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="text-center p-8">Загрузка информации об аниме...</div>;
    }

    if (!anime) {
        return <div className="text-center p-8">Не удалось загрузить информацию об аниме.</div>;
    }

    return (
        <div className="space-y-12">
            <AnimeHeader anime={anime} />
            <AnimeDetails anime={anime} />
            <VideoPlayer kodikData={kodikData} loading={playerLoading} />
            <CommentSection episodeId={id!} />
            <RelatedContent animeId={id!} />
        </div>
    );
};

export default AnimePage;