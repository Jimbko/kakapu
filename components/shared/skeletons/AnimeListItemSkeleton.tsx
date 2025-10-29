import React from 'react';

// FIX: Populating the AnimeListItemSkeleton component which was previously empty.
export const AnimeListItemSkeleton: React.FC = () => {
    return (
        <div className="flex items-start space-x-4 bg-zinc-800/50 p-4 rounded-lg animate-pulse">
            <div className="w-20 h-28 bg-zinc-700 rounded-md flex-shrink-0"></div>
            <div className="flex-grow space-y-2 pt-2">
                <div className="h-6 bg-zinc-700 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                <div className="h-3 bg-zinc-700 rounded w-full mt-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
            </div>
            <div className="hidden sm:block w-24 flex-shrink-0 space-y-2">
                <div className="h-4 bg-zinc-700 rounded w-full"></div>
                <div className="h-6 bg-zinc-700 rounded w-3/4 ml-auto"></div>
            </div>
        </div>
    );
};
