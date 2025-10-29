import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { ShikimoriAnime } from '../types';
import { getFullAnimeDetailsByIds } from '../services/shikimori';

// Helper for debouncing
function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}

interface PosterContextType {
  posters: Map<number, ShikimoriAnime>;
  requestPoster: (id: number) => void;
}

const PosterContext = createContext<PosterContextType | undefined>(undefined);

export const PosterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posters, setPosters] = useState<Map<number, ShikimoriAnime>>(new Map());
  const queueRef = useRef<Set<number>>(new Set());

  const processQueue = async () => {
    if (queueRef.current.size === 0) return;

    const idsToFetch = Array.from(queueRef.current);
    queueRef.current.clear(); // Clear queue immediately to prevent re-fetching

    console.log(`[PosterContext] Batch fetching posters for ${idsToFetch.length} anime.`);

    try {
        const results = await getFullAnimeDetailsByIds(idsToFetch);

        setPosters(prev => {
            const newPosters = new Map(prev);
            results.forEach(anime => {
                // Update the map with the fetched data. Even if the image is still null,
                // this signals the card that the loading process is over.
                newPosters.set(anime.id, anime);
            });
            return newPosters;
        });
    } catch (error) {
        console.error("[PosterContext] Failed to process poster queue:", error);
        // On error, we can still update the map for the failed IDs with a placeholder
        // to prevent them from getting stuck in an infinite loading state.
        setPosters(prev => {
            const newPosters = new Map(prev);
            idsToFetch.forEach(id => {
                if (!newPosters.has(id)) {
                    // We don't have the anime object, so we can't create a perfect placeholder.
                    // But adding *something* will stop the AnimeCard's loading spinner.
                    // A better approach is to ensure getFullAnimeDetailsByIds never fully rejects,
                    // but returns the original data on failure, which it now does.
                }
            });
            return newPosters;
        });
    }
  };

  // Debounce the queue processing to batch requests together
  const debouncedProcessQueue = useCallback(debounce(processQueue, 250), []);

  const requestPoster = (id: number) => {
    // Only queue if we don't already have a definitive poster for it and it's not already in the queue
    if (!posters.has(id) && !queueRef.current.has(id)) {
        queueRef.current.add(id);
        debouncedProcessQueue();
    }
  };

  const value = { posters, requestPoster };

  return (
    <PosterContext.Provider value={value}>
      {children}
    </PosterContext.Provider>
  );
};

export const usePosters = () => {
  const context = useContext(PosterContext);
  if (context === undefined) {
    throw new Error('usePosters must be used within a PosterProvider');
  }
  return context;
};