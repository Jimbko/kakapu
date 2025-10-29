import React, { useState, useEffect } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ICONS } from '../../constants';

// Expanded mock data pool
const allMockActivities = [
    { id: 5114, russian: 'Стальной алхимик: Братство', image: 'https://shikimori.one/system/animes/original/5114.jpg', comments: 128 },
    { id: 9253, russian: 'Врата Штейна', image: 'https://shikimori.one/system/animes/original/9253.jpg', comments: 97 },
    { id: 11061, russian: 'Баскетбол Куроко', image: 'https://shikimori.one/system/animes/original/11061.jpg', comments: 75 },
    { id: 30276, russian: 'Ванпанчмен', image: 'https://shikimori.one/system/animes/original/30276.jpg', comments: 64 },
    { id: 1535, russian: 'Тетрадь смерти', image: 'https://shikimori.one/system/animes/original/1535.jpg', comments: 210 },
    { id: 16498, russian: 'Атака титанов', image: 'https://shikimori.one/system/animes/original/16498.jpg', comments: 189 },
    { id: 21, russian: 'Ван-Пис', image: 'https://shikimori.one/system/animes/original/21.jpg', comments: 350 },
    { id: 136, russian: 'Hunter x Hunter (2011)', image: 'https://shikimori.one/system/animes/original/136.jpg', comments: 155 },
    { id: 38000, russian: 'Клинок, рассекающий демонов', image: 'https://shikimori.one/system/animes/original/38000.jpg', comments: 132 },
    { id: 40748, russian: 'Магическая битва', image: 'https://shikimori.one/system/animes/original/40748.jpg', comments: 115 },
    { id: 9969, russian: 'Невероятные приключения ДжоДжо', image: 'https://shikimori.one/system/animes/original/9969.jpg', comments: 99 },
    { id: 11757, russian: 'Мастера Меча Онлайн', image: 'https://shikimori.one/system/animes/original/11757.jpg', comments: 88 },
];

// FIX: Added generic type parameter <T> to resolve 'Cannot find name T' error and moved function before the component to fix "used before its declaration" error.
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export const CommunityActivity: React.FC = () => {
    // FIX: Added useState hook to manage component state, which resolves errors like 'setRandomActivity is not defined' and 'randomActivity is not defined'.
    const [randomActivity, setRandomActivity] = useState<{id: number, russian: string, image: string, comments: number}[]>([]);

    useEffect(() => {
        // FIX: The error "Cannot find name 'id'" was likely a red herring. The logic is now inside a correctly defined state update.
        setRandomActivity(shuffleArray(allMockActivities).slice(0, 4));
    }, []);

    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-4">Сейчас обсуждают</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {randomActivity.map(anime => (
                    <Link to={`/anime/${anime.id}`} key={anime.id} className="bg-zinc-800/50 rounded-lg p-4 flex items-center space-x-4 group hover:bg-zinc-700/60 transition-colors">
                        <img 
                            src={anime.image} 
                            alt={anime.russian} 
                            className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                            <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">{anime.russian}</h3>
                            <div className="flex items-center space-x-2 text-sm text-zinc-400 mt-1">
                                <div className="w-5 h-5 flex-shrink-0">{ICONS.COMMENTS}</div>
                                <span>{anime.comments} комментариев</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
