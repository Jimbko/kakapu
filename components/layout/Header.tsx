import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { ShikimoriAnime } from '../../types';
import { searchAnime } from '../../services/shikimori';
import { MobileMenu } from './MobileMenu';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ShikimoriAnime[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useAuth();
  const searchContainerRef = useRef<HTMLFormElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsDropdownVisible(true);
    setIsSearchLoading(true);

    const debounceTimer = setTimeout(() => {
      searchAnime(searchQuery, 7)
        .then(results => {
          setSearchResults(results);
        })
        .catch(err => {
          console.error("Live search failed:", err);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearchLoading(false);
        });
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Effect to handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsDropdownVisible(false);
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const handleResultClick = () => {
      setSearchQuery('');
      setIsDropdownVisible(false);
  }

  return (
    <>
      <header className="bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              {ICONS.LOGO}
              <span className="font-bold text-lg hidden sm:inline">AnimeVolnitsa</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-300">
              <Link to="/catalog" className="hover:text-white transition-colors">Каталог</Link>
              <Link to="/top100" className="hover:text-white transition-colors">Топ-100</Link>
              <Link to="/random" className="hover:text-white transition-colors">Случайное</Link>
              <Link to="/community" className="hover:text-white transition-colors">Сообщество</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} ref={searchContainerRef} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length > 1) setIsDropdownVisible(true)}}
                className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                {ICONS.SEARCH}
              </button>

              {isDropdownVisible && (
                <div className="absolute top-full mt-2 w-80 bg-zinc-800 rounded-lg shadow-2xl overflow-hidden border border-zinc-700 fade-in">
                  {isSearchLoading && (
                    <div className="p-4 text-center text-zinc-400">Загрузка...</div>
                  )}
                  {!isSearchLoading && searchResults.length > 0 && (
                    <ul className="max-h-96 overflow-y-auto">
                      {searchResults.map(anime => (
                        <li key={anime.id}>
                          <Link 
                            to={`/anime/${anime.id}`}
                            onClick={handleResultClick}
                            className="flex items-center space-x-3 p-2 hover:bg-zinc-700 transition-colors"
                          >
                            <img src={anime.image.x48} alt={anime.russian} className="w-10 h-14 object-cover rounded-md" />
                            <div>
                              <p className="text-sm font-semibold text-white">{anime.russian || anime.name}</p>
                              <p className="text-xs text-zinc-400">{new Date(anime.aired_on).getFullYear()} · {anime.kind?.toUpperCase()}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!isSearchLoading && searchQuery.length > 1 && searchResults.length === 0 && (
                    <div className="p-4 text-center text-zinc-400">Ничего не найдено.</div>
                  )}
                </div>
              )}
            </form>
            
            {currentUser ? (
              <Link to={`/profile/${currentUser.nickname}`} className="flex items-center space-x-2">
                <img src={currentUser.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
              </Link>
            ) : (
              <button
                onClick={openLoginModal}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors hidden sm:block"
              >
                Войти
              </button>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-zinc-300 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              {ICONS.MENU}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        handleSearchSubmit={handleSearchSubmit}
      />
    </>
  );
};

export default Header;