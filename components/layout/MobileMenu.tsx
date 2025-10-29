import React from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link, useNavigate } = ReactRouterDom;
import { ICONS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, handleSearchSubmit }) => {
  const { currentUser, openLoginModal } = useAuth();
  
  const NavLink: React.FC<{ to: string; children: React.ReactNode; }> = ({ to, children }) => (
    <Link to={to} onClick={onClose} className="block py-3 px-4 text-lg font-semibold text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors">
      {children}
    </Link>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-zinc-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-white">Меню</span>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                    {ICONS.CLOSE}
                </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <input
                  type="text"
                  name="q"
                  placeholder="Поиск по сайту..."
                  className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm w-full focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  {ICONS.SEARCH}
                </button>
            </form>

            <nav className="flex-grow space-y-2">
              <NavLink to="/">Главная</NavLink>
              <NavLink to="/catalog">Каталог</NavLink>
              <NavLink to="/top100">Топ-100</NavLink>
              <NavLink to="/random">Случайное</NavLink>
              <NavLink to="/community">Сообщество</NavLink>
            </nav>

            <div className="mt-auto">
              {currentUser ? (
                <Link to={`/profile/${currentUser.nickname}`} onClick={onClose} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800">
                  <img src={currentUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
                  <span className="font-semibold text-white">{currentUser.nickname}</span>
                </Link>
              ) : (
                <button
                  onClick={() => { openLoginModal(); onClose(); }}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-md text-sm font-semibold transition-colors"
                >
                  Войти
                </button>
              )}
            </div>
        </div>
      </div>
    </>
  );
};