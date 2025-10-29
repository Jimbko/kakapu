import React from 'react';
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ShikimoriAnime } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

interface SearchResultsDropdownProps {
    results: ShikimoriAnime[];
    loading: boolean;
    query: string;
    onClose: () => void;
}

const SearchResultItem: React.FC<{ anime: ShikimoriAnime, onClick: () => void }> = ({ anime, onClick }) => {
    const imageUrl = anime.image?.x96 || anime.image?.x48;
    return (
        <Link to={`/anime/${anime.id}`} onClick={onClick} className="flex items-center p-2 rounded-md hover:bg-zinc-700 transition-colors">
            {imageUrl ? (
                <img src={imageUrl} alt={anime.russian} className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
            ) : (
                <div className="w-12 h-16 flex-shrink-0">
                    <ImagePlaceholder text="" />
                </div>
            )}
            <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-white truncate">{anime.russian || anime.name}</p>
                <p className="text-xs text-zinc-400">
                    {anime.kind?.toUpperCase()}
                    {anime.aired_on && `, ${new Date(anime.aired_on).getFullYear()}`}
                </p>
            </div>
        </Link>
    );
};


export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, loading, query, onClose }) => {
    return (
        <div className="absolute top-full mt-2 w-96 max-w-lg bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden fade-in">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="p-4">
                        <LoadingSpinner size="sm" message="Идет поиск..." />
                    </div>
                )}
                {!loading && results.length > 0 && (
                    <div className="p-2 space-y-1">
                        {results.slice(0, 7).map(anime => (
                            <SearchResultItem key={anime.id} anime={anime} onClick={onClose} />
                        ))}
                    </div>
                )}
                {!loading && results.length === 0 && (
                    <div className="p-4 text-center text-zinc-400 text-sm">
                        <p>Ничего не найдено по запросу "{query}"</p>
                    </div>
                )}
            </div>
             {!loading && (
                <Link
                    to={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="block bg-zinc-900/80 hover:bg-purple-600 p-3 text-center text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                    {results.length > 0 ? 'Все результаты' : 'Попробовать на странице поиска'}
                </Link>
             )}
        </div>
    );
};
