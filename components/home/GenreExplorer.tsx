import React, { useState, useEffect } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;

const allGenres = [
    { name: 'Сёнэн', id: '27' },
    { name: 'Драма', id: '8' },
    { name: 'Фэнтези', id: '10' },
    { name: 'Экшен', id: '1' },
    { name: 'Комедия', id: '4' },
    { name: 'Приключения', id: '2' },
    { name: 'Романтика', id: '22' },
    { name: 'Фантастика', id: '24' },
    { name: 'Психологическое', id: '40' },
    { name: 'Повседневность', id: '36' },
    { name: 'Сверхъестественное', id: '37' },
    { name: 'Детектив', id: '7' },
    { name: 'Сейнен', id: '42' },
    { name: 'Спорт', id: '30' },
    { name: 'Триллер', id: '41' },
    { name: 'Ужасы', id: '14' },
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

export const GenreExplorer: React.FC = () => {
    // FIX: Added useState hook to manage component state, which resolves errors like 'setRandomGenres is not defined' and 'randomGenres is not defined'.
    const [randomGenres, setRandomGenres] = useState<{name: string, id: string}[]>([]);

    useEffect(() => {
        // FIX: The error "Spread types may only be created from object types" was likely a red herring. The logic is now inside a correctly defined state update.
        setRandomGenres(shuffleArray(allGenres).slice(0, 8));
    }, []);

    return (
        <section>
             <h2 className="text-2xl font-bold text-white mb-4">Исследуйте жанры</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {randomGenres.map(genre => (
                    <Link
                        to={`/catalog?genre=${genre.id}`}
                        key={genre.id}
                        className="text-center font-semibold text-white bg-zinc-800/50 rounded-lg py-6 px-4 hover:bg-purple-600/50 hover:scale-105 transition-all duration-300"
                    >
                        {genre.name}
                    </Link>
                ))}
             </div>
        </section>
    );
};
