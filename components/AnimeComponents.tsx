import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';
import { ShikimoriAnime } from '../types';

// --- ANIME CARD FOR CAROUSELS ---
interface AnimeCardProps {
  anime: ShikimoriAnime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const ratingColor = parseFloat(anime.score) >= 8.0 ? 'bg-emerald-500' : parseFloat(anime.score) >= 6.5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Link to={`/anime/${anime.id}`} className="flex-shrink-0 w-48 group relative fade-in">
      <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
        <img
          src={`https://shikimori.one${anime.image.original}`}
          alt={anime.russian || anime.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded-md flex items-center space-x-1 backdrop-blur-md bg-black/50">
          <span className={`${ratingColor} p-1 rounded-full`}>{ICONS.STAR_FILLED}</span>
          <span>{anime.score}</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold mt-2 text-gray-200 group-hover:text-white transition-colors truncate">
        {anime.russian || anime.name}
      </h3>
    </Link>
  );
};

// --- ANIME CAROUSEL FOR HOMEPAGE ---
interface AnimeCarouselProps {
  title: string;
  animeList: ShikimoriAnime[];
  loading: boolean;
  listType: string;
  listTitle: string;
}

export const AnimeCarousel: React.FC<AnimeCarouselProps> = ({ title, animeList, loading, listType, listTitle }) => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link to={`/list/${listType}/${encodeURIComponent(listTitle)}`} className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
          Смотреть все →
        </Link>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
        {loading && Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48">
            <div className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="h-4 bg-zinc-800 rounded mt-2 animate-pulse w-3/4"></div>
          </div>
        ))}
        {!loading && animeList.map(anime => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};


// --- ANIME INFO FOR ANIME PAGE ---
interface AnimeInfoProps {
    anime: ShikimoriAnime;
}

const stripHtml = (html: string | null) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export const AnimeInfo: React.FC<AnimeInfoProps> = ({ anime }) => {
    const description = stripHtml(anime.description_html) || 'Описание отсутствует.';

    return (
      <div className="flex flex-col md:flex-row gap-8 mt-[-100px] relative z-10 px-4 md:px-0">
        <div className="md:w-1/4 flex-shrink-0">
            <img src={`https://shikimori.one${anime.image.original}`} alt={anime.russian} className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl shadow-black/50" />
        </div>
        <div className="md:w-3/4 bg-zinc-800/50 backdrop-blur-sm rounded-lg p-6 fade-in">
            <h1 className="text-4xl font-bold text-white">{anime.russian || anime.name}</h1>
            <h2 className="text-lg text-zinc-400 font-medium">{anime.name}</h2>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-zinc-400 mt-2 text-sm">
                <div className="flex items-center space-x-1 font-bold text-yellow-400">
                    {ICONS.STAR_FILLED}
                    <span>{anime.score}</span>
                </div>
                <span className="font-semibold">{anime.kind?.toUpperCase()}</span>
                <span className="capitalize">{anime.status.replace('_', ' ')}</span>
                <span>{new Date(anime.aired_on).getFullYear()}</span>
                 <span>{anime.episodes || '?'} эп.</span>
            </div>
            <p className="text-zinc-300 mt-4 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">{description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {anime.genres.map(genre => (
                    <span key={genre.id} className="bg-zinc-700 text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-full">{genre.russian}</span>
                ))}
            </div>
             <div className="flex space-x-3 mt-6">
                <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-md font-semibold flex items-center space-x-2 transition-transform transform hover:scale-105">
                    {ICONS.HEART}
                    <span>В любимые</span>
                </button>
                <button className="bg-zinc-700 hover:bg-zinc-600 px-8 py-3 rounded-md font-semibold flex items-center space-x-2 transition-colors">
                    {ICONS.BOOKMARK}
                    <span>Смотреть позже</span>
                </button>
            </div>
        </div>
      </div>
    );
};
