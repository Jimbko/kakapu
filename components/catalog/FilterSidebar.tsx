import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Genre } from '../../types';
import { getGenres } from '../../services/shikimori';
import { ICONS } from '../../constants';

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-zinc-700 py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-semibold text-white">
                {title}
                {isOpen ? ICONS.CHEVRON_UP : ICONS.CHEVRON_DOWN}
            </button>
            {isOpen && <div className="mt-3 space-y-2">{children}</div>}
        </div>
    );
};

const SelectFilter: React.FC<{ name: string; options: { value: string; label: string }[]; label: string }> = ({ name, options, label }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = searchParams.get(name) || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newParams = new URLSearchParams(searchParams);
        if (e.target.value) {
            newParams.set(name, e.target.value);
        } else {
            newParams.delete(name);
        }
        newParams.set('page', '1'); // Reset page on filter change
        setSearchParams(newParams);
    };

    return (
        <div>
            <label className="text-sm font-medium text-zinc-400">{label}</label>
            <select
                value={value}
                onChange={handleChange}
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
                <option value="">Любой</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};

const years = Array.from({ length: new Date().getFullYear() - 1960 + 1 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
});

const seasons = [
    { value: 'fall', label: 'Осень' },
    { value: 'summer', label: 'Лето' },
    { value: 'spring', label: 'Весна' },
    { value: 'winter', label: 'Зима' },
];

const statuses = [
    { value: 'ongoing', label: 'Выходит' },
    { value: 'released', label: 'Вышло' },
    { value: 'anons', label: 'Анонс' },
];

const kinds = [
    { value: 'tv', label: 'ТВ Сериал' },
    { value: 'movie', label: 'Фильм' },
    { value: 'ova', label: 'OVA' },
    { value: 'ona', label: 'ONA' },
    { value: 'special', label: 'Спешл' },
];

const orders = [
    { value: 'ranked', label: 'По рейтингу' },
    { value: 'popularity', label: 'По популярности' },
    { value: 'aired_on', label: 'По дате выхода' },
    { value: 'name', label: 'По названию' },
];

export const FilterSidebar: React.FC = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedGenres = searchParams.get('genre')?.split(',') || [];

    useEffect(() => {
        getGenres().then(setGenres);
    }, []);
    
    const handleGenreChange = (genreId: string) => {
        const newParams = new URLSearchParams(searchParams);
        const currentGenres = newParams.get('genre')?.split(',') || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter(g => g !== genreId)
            : [...currentGenres, genreId];
        
        if (newGenres.length > 0) {
            newParams.set('genre', newGenres.join(','));
        } else {
            newParams.delete('genre');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleReset = () => {
        setSearchParams(new URLSearchParams());
    };

    return (
        <div className="bg-zinc-800/50 p-4 rounded-lg flex-shrink-0 w-full lg:w-64">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">{ICONS.FILTER} Фильтры</h3>
                 <button onClick={handleReset} className="text-xs text-zinc-400 hover:text-white">Сбросить</button>
            </div>
            
            <div className="space-y-4">
                <SelectFilter name="order" options={orders} label="Сортировка" />
                <FilterSection title="Жанры">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {genres.map(genre => (
                            <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(String(genre.id))}
                                    onChange={() => handleGenreChange(String(genre.id))}
                                    className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-zinc-300">{genre.russian}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
                <SelectFilter name="status" options={statuses} label="Статус" />
                <SelectFilter name="kind" options={kinds} label="Тип" />
                <div className="flex gap-2">
                    <SelectFilter name="season_year" options={years} label="Год" />
                    <SelectFilter name="season_of_year" options={seasons} label="Сезон" />
                </div>
            </div>
        </div>
    );
};