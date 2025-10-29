import React from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { ICONS } from '../../constants';

const Footer: React.FC = () => {
    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex items-center space-x-2">
                        {ICONS.LOGO}
                        <span className="font-bold text-white">AnimeVolnitsa</span>
                    </div>
                    
                    <div className="text-center text-sm text-zinc-400">
                        <p>&copy; {new Date().getFullYear()} AnimeVolnitsa. Все права защищены.</p>
                        <p className="mt-1">Сайт не претендует на авторские права и создан в ознакомительных целях.</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors">{ICONS.VK}</a>
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors">{ICONS.TELEGRAM}</a>
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors">{ICONS.DISCORD}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;