import React from 'react';

interface PlaceholderContentProps {
  title: string;
  message: string;
  icon: React.ReactElement;
}

export const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ title, message, icon }) => {
  return (
    <div className="bg-zinc-800/50 p-8 rounded-lg text-center flex flex-col items-center">
      <div className="text-5xl text-purple-400 mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-zinc-400 max-w-md">{message}</p>
    </div>
  );
};