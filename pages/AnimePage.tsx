import React, { useState, useEffect, useRef } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { useParams } = ReactRouterDom;
import { ShikimoriAnime, KodikSearchResult } from '../types';
import { getAnimeById } from '../services/shikimori';
import { findKodikPlayer } from '../services/kodik';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../components/CommunityComponents';
import { RelatedContent } from '../components/anime/RelatedContent';
import { AnimePageSkeleton } from '../components/shared/skeletons/AnimePageSkeleton';
import { ICONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ImagePlaceholder } from '../components/shared/ImagePlaceholder';
import { StatusListKey } from '../contexts/AuthContext';

// Helper component for displaying anime details
const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="font-semibold text-white">{children || 'N/A'}</p>
    </div>
);

const AnimePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser, openLoginModal, getAnimeStatus, setAnimeStatus, isInList, addToList, removeFromList, addToast } = useAuth();

    const [anime, setAnime] = useState<ShikimoriAnime | null>(null);
    const [kodikData, setKodikData] = useState<KodikSearchResult | null>(null);
    const [loadingAnime, setLoadingAnime] = useState(true);
    const [loadingKodik, setLoadingKodik] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentStatus, setCurrentStatus] = useState<StatusListKey | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);


    const statusOptions: { label: string; value: StatusListKey }[] = [
        { label: 'Смотрю', value: 'watching' },
        { label: 'Запланировано', value: 'planned' },
        { label: 'Просмотрено', value: 'completed' },
        { label: 'Брошено', value: 'dropped' },
    ];

    useEffect(() => {
        if (!id) return;
        
        const fetchData = async () => {
            setLoadingAnime(true);
            setLoadingKodik(true);
            setError(null);
            setAnime(null);
            try {
                const animeData = await getAnimeById(id);
                setAnime(animeData);

                // Fetch player data
                findKodikPlayer(animeData).then(playerData => {
                    setKodikData(playerData);
                }).finally(() => {
                    setLoadingKodik(false);
                });

            } catch (err) {
                console.error("Failed to fetch anime data:", err);
                setError("Не удалось загрузить информацию об аниме.");
            } finally {
                setLoadingAnime(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (anime && currentUser) {
            setCurrentStatus(getAnimeStatus(anime.id));
            setIsFavorite(isInList('favorite', anime.id));
        } else {
            setCurrentStatus(null);
            setIsFavorite(false);
        }
    }, [anime, getAnimeStatus, isInList, currentUser]);

    // Handle clicks outside the status dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleStatusChange = (newStatus: StatusListKey | '') => {
        if (!currentUser || !anime) return;
        
        const statusToSet = newStatus === '' ? null : newStatus;
        setAnimeStatus({ id: anime.id, name: anime.name }, statusToSet);

        let statusText = 'статус удален';
        if (statusToSet) {
            const statusLabel = statusOptions.find(opt => opt.value === statusToSet)?.label || statusToSet;
            statusText = `установлен статус "${statusLabel}"`;
        }
        
        addToast(`Для "${anime.russian || anime.name}" ${statusText}`, 'success');
        setIsStatusSelectorOpen(false);
    };

    const handleFavoriteToggle = () => {
        if (!currentUser || !anime) {
            openLoginModal();
            return;
        }

        const simpleAnime = { id: anime.id, name: anime.name };
        if (isFavorite) {
            removeFromList('favorite', anime.id);
            addToast(`"${anime.russian || anime.name}" удалено из любимого`, 'info');
        } else {
            addToList('favorite', simpleAnime);
            addToast(`"${anime.russian || anime.name}" добавлено в любимое`, 'success');
        }
    };

    if (loadingAnime) {
        return <AnimePageSkeleton />;
    }

    if (error) {
        return <div className="text-center p-8 text-red-400">{error}</div>;
    }

    if (!anime) {
        return <div className="text-center p-8">Аниме не найдено.</div>;
    }
    
    const imageUrl = anime.image?.original || anime.image?.preview;
    const actionButtonClasses = "w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors";

    return (
        <div className="space-y-12">
            {/* Header section */}
            <header className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <div className="aspect-[2/3] w-full bg-zinc-800 rounded-xl overflow-hidden shadow-lg">
                        {imageUrl ? (
                            <img src={imageUrl} alt={anime.russian} className="w-full h-full object-cover" />
                        ) : (
                            <ImagePlaceholder />
                        )}
                    </div>
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                    <p className="text-sm text-purple-400 font-semibold">{new Date(anime.aired_on).getFullYear()} · {anime.kind?.toUpperCase()} · {anime.status}</p>
                    <h1 className="text-3xl md:text-5xl font-black text-white mt-1">{anime.russian}</h1>
                    <p className="text-lg text-zinc-400">{anime.name}</p>

                    <div className="flex items-center space-x-2 mt-6">
                        <div className="flex items-center space-x-2 p-2 pr-4 bg-zinc-800/80 rounded-full">
                            <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-300 font-bold flex items-center justify-center text-lg">
                                {anime.score}
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-white">Рейтинг Shikimori</p>
                                <p className="text-xs text-zinc-400">На основе {anime.rates_scores_stats.reduce((acc, item) => acc + item.value, 0)} оценок</p>
                            </div>
                        </div>
                    </div>
                    
                    {currentUser ? (
                        <div className="flex items-center space-x-2 mt-6">
                            <button onClick={() => addToast('Функция написания обзоров в разработке', 'info')} className={actionButtonClasses} aria-label="Написать обзор"><div className="w-6 h-6 text-zinc-300">{ICONS.PENCIL}</div></button>
                            <button onClick={() => addToast('Функция "Поделиться" в разработке', 'info')} className={actionButtonClasses} aria-label="Поделиться"><div className="w-6 h-6 text-zinc-300">{ICONS.QR_CODE}</div></button>
                            <button onClick={handleFavoriteToggle} className={`${actionButtonClasses} ${isFavorite ? 'bg-red-500/20' : ''}`} aria-label="Добавить в любимое"><div className={`w-6 h-6 ${isFavorite ? 'text-red-400' : 'text-zinc-300'}`}>{ICONS.HEART}</div></button>
                            <button onClick={() => addToast('Функция отправки отчетов в разработке', 'info')} className={actionButtonClasses} aria-label="Сообщить о проблеме"><div className="w-6 h-6 text-zinc-300">{ICONS.BUG}</div></button>
                            <div ref={statusDropdownRef} className="relative">
                                <button onClick={() => setIsStatusSelectorOpen(prev => !prev)} className={`${actionButtonClasses} ${currentStatus ? 'bg-purple-600/20' : ''}`} aria-label="Добавить в список"><div className={`w-6 h-6 ${currentStatus ? 'text-purple-400' : 'text-zinc-300'}`}>{ICONS.CONTACT_BOOK}</div></button>
                                {isStatusSelectorOpen && (
                                    <div className="absolute top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 w-48 fade-in">
                                        {statusOptions.map(opt => (
                                            <button key={opt.value} onClick={() => handleStatusChange(opt.value)} className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 ${currentStatus === opt.value ? 'font-bold text-purple-400' : 'text-zinc-200'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                        {currentStatus && (
                                            <button onClick={() => handleStatusChange('')} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 border-t border-zinc-700">
                                                Удалить из списка
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 bg-zinc-800/50 p-4 rounded-lg text-center border border-zinc-700">
                            <p className="text-zinc-300 text-sm">
                                <button onClick={openLoginModal} className="font-bold text-purple-400 hover:underline">
                                    Войдите
                                </button>
                                , чтобы добавлять аниме в списки и отслеживать свой прогресс.
                            </p>
                        </div>
                    )}


                    <div className="mt-8">
                        <h3 className="font-bold text-white mb-2">Описание</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl line-clamp-5">
                           {anime.description || 'Описание отсутствует.'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="space-y-12">
                <section>
                    <VideoPlayer kodikData={kodikData} loading={loadingKodik} />
                </section>

                <section>
                    <div className="bg-zinc-800/50 p-6 rounded-lg">
                         <h3 className="text-xl font-bold text-white mb-4">Детали</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                             <DetailItem label="Тип">{anime.kind?.toUpperCase()}</DetailItem>
                             <DetailItem label="Эпизоды">{anime.episodes_aired} / {anime.episodes || '?'}</DetailItem>
                             <DetailItem label="Статус">{anime.status}</DetailItem>
                             <DetailItem label="Рейтинг MPAA">{anime.rating || 'N/A'}</DetailItem>
                             <DetailItem label="Длительность">{anime.duration ? `${anime.duration} мин.` : 'N/A'}</DetailItem>
                             <DetailItem label="Студия">
                                {anime.studios.map(s => s.name).join(', ') || 'N/A'}
                             </DetailItem>
                             <DetailItem label="Жанры">
                                {anime.genres.map(g => g.russian).join(', ')}
                             </DetailItem>
                         </div>
                    </div>
                </section>

                <section>
                    <RelatedContent animeId={id!} />
                </section>

                <section>
                    <CommentSection episodeId={id!} />
                </section>
            </main>
        </div>
    );
};

export default AnimePage;
