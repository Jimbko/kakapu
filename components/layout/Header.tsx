import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close menu on search
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('q');
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query.toString())}`);
      // Clear search input after submission
      (e.target as HTMLFormElement).reset();
    }
  };
  
  const NavItem: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
    const activeClassName = "text-white bg-zinc-700/50";
    const inactiveClassName = "text-zinc-400 hover:text-white hover:bg-zinc-700/50";

    return (
      <NavLink 
        to={to} 
        className={({ isActive }) => `${isActive ? activeClassName : inactiveClassName} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
      >
        {children}
      </NavLink>
    )
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              {ICONS.LOGO}
              <span className="font-bold text-lg hidden sm:inline">AnimeVolnitsa</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <NavItem to="/catalog">Каталог</NavItem>
              <NavItem to="/top100">Топ-100</NavItem>
              <NavItem to="/random">Случайное</NavItem>
              <NavItem to="/community">Сообщество</NavItem>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <input
                type="text"
                name="q"
                placeholder="Поиск..."
                className="bg-zinc-800 border border-zinc-700 rounded-full pl-4 pr-10 py-1.5 text-sm w-40 focus:w-64 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                {ICONS.SEARCH}
              </button>
            </form>
            <div className="hidden md:block">
              {currentUser ? (
                <Link to={`/profile/${currentUser.nickname}`} className="block">
                  <img src={currentUser.avatar} alt="User Avatar" className="w-9 h-9 rounded-full border-2 border-transparent hover:border-purple-500 transition-colors" />
                </Link>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  Войти
                </button>
              )}
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-400 hover:text-white">
                {ICONS.MENU}
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} handleSearchSubmit={handleSearchSubmit} />
    </header>
  );
};

export default Header;
