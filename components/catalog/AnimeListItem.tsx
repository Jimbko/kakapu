import React from 'react';
// FIX: Populating the AnimeListItem component which was previously empty.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ShikimoriAnime } from '../../types';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';
import { ICONS } from '../../constants';

export const AnimeListItem: React.FC<{ anime: ShikimoriAnime }> = ({ anime }) => {
    const imageUrl = anime.image?.preview || anime.image?.x96;
    const year = anime.aired_on ? new Date(anime.aired_on).getFullYear() : '?';

    return (
        <Link to={`/anime/${anime.id}`} className="flex items-start space-x-4 bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/60 transition-colors duration-200 group">
            <div className="w-20 h-28 object-cover rounded-md flex-shrink-0 bg-zinc-700 overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={anime.russian} className="w-full h-full object-cover" />
                ) : (
                    <ImagePlaceholder text="" />
                )}
            </div>

            <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors truncate">{anime.russian || anime.name}</h3>
                <p className="text-sm text-zinc-400 truncate">{anime.name}</p>
                <div className="text-xs text-zinc-400 mt-2 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {parseFloat(anime.score) > 0 && (
                        <div className="flex items-center space-x-1 font-bold text-yellow-400 h-5 w-5">
                            {ICONS.STAR_FILLED}
                            <span className="ml-1">{anime.score}</span>
                        </div>
                    )}
                    <span>{anime.kind?.toUpperCase()}</span>
                    <span>{year}</span>
                    <span>{anime.status}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                    {anime.genres.map(g => g.russian).join(', ')}
                </p>
            </div>

            <div className="hidden sm:flex flex-col items-end text-right flex-shrink-0 w-24">
                <span className="text-sm font-semibold text-zinc-300">Эпизоды</span>
                <span className="text-lg font-bold text-white">{anime.episodes_aired} / {anime.episodes || '?'}</span>
            </div>
        </Link>
    );
};
