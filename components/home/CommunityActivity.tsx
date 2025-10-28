import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../../constants';

// Mock data for demonstration purposes
const mockActivity = [
    { id: 5114, russian: 'Стальной алхимик: Братство', image: 'https://shikimori.one/system/animes/original/5114.jpg', comments: 128 },
    { id: 9253, russian: 'Врата Штейна', image: 'https://shikimori.one/system/animes/original/9253.jpg', comments: 97 },
    { id: 11061, russian: 'Баскетбол Куроко', image: 'https://shikimori.one/system/animes/original/11061.jpg', comments: 75 },
    { id: 30276, russian: 'Ванпанчмен', image: 'https://shikimori.one/system/animes/original/30276.jpg', comments: 64 },
];


export const CommunityActivity: React.FC = () => {
    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-4">Сейчас обсуждают</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockActivity.map(anime => (
                    <Link to={`/anime/${anime.id}`} key={anime.id} className="bg-zinc-800/50 rounded-lg p-4 flex items-center space-x-4 group hover:bg-zinc-700/60 transition-colors">
                        <img 
                            src={anime.image} 
                            alt={anime.russian} 
                            className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                            <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">{anime.russian}</h3>
                            <div className="flex items-center space-x-2 text-sm text-zinc-400 mt-1">
                                {ICONS.COMMENTS}
                                <span>{anime.comments} комментариев</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
