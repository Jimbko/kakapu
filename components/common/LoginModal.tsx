import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes scale-in {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s forwards ease-out;
          }
        `}</style>
        <h2 className="text-2xl font-bold text-white text-center">Вход в аккаунт</h2>
        <p className="text-zinc-400 mt-2 text-center text-sm">
          Так как это демонстрационная версия, вы можете войти в заранее подготовленный профиль.
        </p>
        <div className="mt-6 flex flex-col items-center">
            <img src="https://i.imgur.com/tLp2d62.jpeg" alt="dragger1337" className="w-20 h-20 rounded-full border-2 border-purple-500" />
            <span className="font-semibold text-white mt-2">dragger1337</span>
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors transform hover:scale-105"
          >
            Войти как dragger1337
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-zinc-400 hover:text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
