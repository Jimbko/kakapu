import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/20">
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
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
              {ICONS.SEARCH}
            </button>
          </form>
          {currentUser ? (
            <Link to={`/profile/${currentUser.nickname}`} className="flex items-center space-x-2">
              <img src={currentUser.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;