import React, { useState, useEffect, useRef } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link, useNavigate } = ReactRouterDom;
import { ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';
import { searchAnime } from '../../services/shikimori';
import { ShikimoriAnime } from '../../types';
import { SearchResultsDropdown } from './SearchResultsDropdown';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, openLoginModal } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // State for live search
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ShikimoriAnime[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!query.trim()) {
            setLoading(false);
            setResults([]);
            return;
        }

        setLoading(true);
        setIsDropdownVisible(true);

        const timerId = setTimeout(() => {
            searchAnime(query.trim())
                .then(data => {
                    setResults(data);
                })
                .catch(err => {
                    console.error("Search failed:", err);
                    setResults([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(timerId);
    }, [query]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get('q');
        if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            if (isMenuOpen) setIsMenuOpen(false);
        }
    };

    const NavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
        <Link to={to} className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">{children}</Link>
    );

    return (
        <header className="bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2">
                            {ICONS.LOGO}
                            <span className="font-bold text-white hidden sm:inline">AnimeVolnitsa</span>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <NavLink to="/catalog">Каталог</NavLink>
                            <NavLink to="/top100">Топ-100</NavLink>
                            <NavLink to="/random">Случайное</NavLink>
                            <NavLink to="/community">Сообщество</NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div ref={searchRef} className="relative hidden md:block">
                            <input
                                type="text"
                                name="q"
                                placeholder="Поиск..."
                                className="bg-zinc-800 border border-transparent rounded-full px-4 py-1.5 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => { if(query.trim()) setIsDropdownVisible(true); }}
                                autoComplete="off"
                            />
                            <Link
                                to={`/search?q=${encodeURIComponent(query.trim())}`}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                                onClick={() => setIsDropdownVisible(false)}
                                aria-label="Search"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-zinc-400"></div>
                                ) : (
                                    <div className="h-5 w-5">{ICONS.SEARCH}</div>
                                )}
                            </Link>
                            {isDropdownVisible && query.trim() && (
                                <SearchResultsDropdown 
                                    results={results}
                                    loading={loading}
                                    query={query}
                                    onClose={() => setIsDropdownVisible(false)}
                                />
                            )}
                        </div>

                        <div className="hidden md:flex items-center">
                            {currentUser ? (
                                <Link to={`/profile/${currentUser.nickname}`} className="flex items-center space-x-2 p-1 rounded-full hover:bg-zinc-800">
                                    <img src={currentUser.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
                                    <span className="text-sm font-semibold text-white pr-2">{currentUser.nickname}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={openLoginModal}
                                    className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                                >
                                    Войти
                                </button>
                            )}
                        </div>

                        <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-zinc-300 hover:text-white">
                            {ICONS.MENU}
                        </button>
                    </div>
                </div>
            </div>
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} handleSearchSubmit={handleSearchSubmit} />
        </header>
    );
};

export default Header;