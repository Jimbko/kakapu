import React from 'react';

export const AnimeCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800 rounded-lg"></div>
      <div className="h-4 bg-zinc-800 rounded mt-2 w-3/4"></div>
    </div>
  );
};
