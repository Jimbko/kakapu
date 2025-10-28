import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
      <p className="font-semibold">Произошла ошибка</p>
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md text-sm transition-colors"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
};
