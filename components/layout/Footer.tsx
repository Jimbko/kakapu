import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950/50 border-t border-zinc-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {ICONS.LOGO}
              <span className="font-bold text-lg">AnimeVolnitsa</span>
            </Link>
            <p className="text-sm text-zinc-400">
              Смотрите аниме онлайн в хорошем качестве. Мы не храним файлы на сервере, а лишь предоставляем удобный поиск по открытым источникам.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><Link to="/top100" className="hover:text-purple-400">Топ-100</Link></li>
              <li><Link to="/random" className="hover:text-purple-400">Случайное аниме</Link></li>
              <li><Link to="/community" className="hover:text-purple-400">Сообщество</Link></li>
              <li><a href="#" className="hover:text-purple-400">Правообладателям</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Присоединяйтесь</h3>
            <div className="flex space-x-4 text-zinc-400">
              <a href="#" className="hover:text-white">{ICONS.VK}</a>
              <a href="#" className="hover:text-white">{ICONS.TELEGRAM}</a>
              <a href="#" className="hover:text-white">{ICONS.DISCORD}</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} AnimeVolnitsa. Все права защищены, но это не точно.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
