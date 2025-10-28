import React from 'react';
import { Link } from 'react-router-dom';

export const CallToAction: React.FC = () => {
    return (
        <section className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white">Присоединяйтесь к нашему сообществу!</h2>
            <p className="text-indigo-200 mt-2 max-w-2xl mx-auto">
                Обсуждайте любимые тайтлы, делитесь мнениями и находите единомышленников. На AnimeVolnitsa ваше мнение имеет значение.
            </p>
            <Link 
                to="/community"
                className="mt-6 inline-block bg-white text-purple-800 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
            >
                Перейти в сообщество
            </Link>
        </section>
    );
};
