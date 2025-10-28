import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGenres } from '../../services/shikimori';
import { Genre } from '../../types';
import { ICONS } from '../../constants';

const years = Array.from({ length: new Date().getFullYear() - 1960 + 2 }, (_, i) => String(new Date().getFullYear() + 1 - i));

const filterOptions = {
    order: [
        { value: 'ranked', label: 'По рейтингу' },
        { value: 'popularity', label: 'По популярности' },
        { value: 'name', label: 'По алфавиту' },
        { value: 'aired_on', label: 'По дате выхода' },
    ],
    kind: [
        { value: 'tv', label: 'TV Сериал' },
        { value: 'movie', label: 'Фильм' },
        { value: 'ova', label: 'OVA' },
        { value: 'ona', label: 'ONA' },
        { value: 'special', label: 'Спешл' },
        { value: 'music', label: 'Клип' },
    ],
    status: [
        { value: 'anons', label: 'Анонс' },
        { value: 'ongoing', label: 'Онгоинг' },
        { value: 'released', label: 'Вышел' },
    ],
    season_of_year: [
        { value: 'winter', label: 'Зима' },
        { value: 'spring', label: 'Весна' },
        { value: 'summer', label: 'Лето' },
        { value: 'fall', label: 'Осень' },
    ]
};

const FilterSelect: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}> = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-zinc-400 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md p-2 text-sm text-zinc-200 focus:ring-1 focus:ring-purple-500 focus:outline-none"
        >
            <option value="">Любой</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


export const FilterSidebar: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            const data = await getGenres();
            // Include genres that are for anime or are common (kind is not 'manga')
            setGenres(data.filter(g => g.kind !== 'manga'));
        };
        fetchGenres();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        setSearchParams(newParams, { replace: true });
        if(isMobileOpen) setIsMobileOpen(false);
    };
    
    const handleReset = () => {
        setSearchParams({}, { replace: true });
        if(isMobileOpen) setIsMobileOpen(false);
    };

    const renderFilters = () => (
         <div className="space-y-4">
            <FilterSelect label="Сортировка" name="order" value={searchParams.get('order') || ''} onChange={handleFilterChange} options={filterOptions.order} />
            <FilterSelect label="Тип" name="kind" value={searchParams.get('kind') || ''} onChange={handleFilterChange} options={filterOptions.kind} />
            <FilterSelect label="Статус" name="status" value={searchParams.get('status') || ''} onChange={handleFilterChange} options={filterOptions.status} />
            
            <div className="grid grid-cols-2 gap-2">
                <FilterSelect label="Год" name="season_year" value={searchParams.get('season_year') || ''} onChange={handleFilterChange} options={years.map(y => ({ value: y, label: y }))} />
                <FilterSelect label="Сезон" name="season_of_year" value={searchParams.get('season_of_year') || ''} onChange={handleFilterChange} options={filterOptions.season_of_year} />
            </div>

            {genres.length > 0 && (
                <FilterSelect label="Жанр" name="genre" value={searchParams.get('genre') || ''} onChange={handleFilterChange} options={genres.map(g => ({ value: String(g.id), label: g.russian }))} />
            )}

            <button
                onClick={handleReset}
                className="w-full mt-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md font-semibold transition-colors text-sm"
            >
                Сбросить фильтры
            </button>
        </div>
    );

    return (
        <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Button */}
            <div className="lg:hidden mb-4">
                 <button 
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-full flex justify-between items-center px-4 py-2 bg-zinc-800 rounded-md font-semibold"
                >
                    <span>{ICONS.FILTER} Фильтры</span>
                    <span className={`transform transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}>{ICONS.CHEVRON_DOWN}</span>
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Фильтры</h3>
                {renderFilters()}
            </div>
            
             {/* Mobile View (collapsible) */}
            {isMobileOpen && (
                 <div className="lg:hidden bg-zinc-800/50 p-4 rounded-lg mb-4">
                    {renderFilters()}
                </div>
            )}
        </aside>
    );
};