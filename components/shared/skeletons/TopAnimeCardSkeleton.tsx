import React from 'react';

export const TopAnimeCardSkeleton: React.FC = () => {
    return (
        <div className="flex items-start space-x-4 bg-zinc-800/50 p-4 rounded-lg animate-pulse">
            <div className="h-8 w-12 bg-zinc-700 rounded-md"></div>
            <div className="w-16 h-24 bg-zinc-700 rounded-md flex-shrink-0"></div>
            <div className="flex-grow space-y-2 pt-2">
                <div className="h-5 bg-zinc-700 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
            </div>
        </div>
    );
};
