import React, { useState, useEffect } from 'react';
import { KodikSearchResult, KodikTranslation } from '../types';

interface VideoPlayerProps {
  kodikData: KodikSearchResult | null;
  loading: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ kodikData, loading }) => {
  const [selectedTranslationId, setSelectedTranslationId] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [playerUrl, setPlayerUrl] = useState<string>('');

  useEffect(() => {
    // Set initial state when data arrives
    if (kodikData && kodikData.translations.length > 0) {
      const initialTranslation = kodikData.translations[0];
      setSelectedTranslationId(initialTranslation.id);
      setSelectedEpisode(1);
    } else {
        setSelectedTranslationId(null);
    }
  }, [kodikData]);

  useEffect(() => {
    // Rebuild URL when selection changes
    if (kodikData?.link && selectedTranslationId) {
      let baseUrl = kodikData.link.startsWith('//') ? `https:${kodikData.link}` : kodikData.link;
      const separator = baseUrl.includes('?') ? '&' : '?';
      
      const newUrl = `${baseUrl}${separator}episode=${selectedEpisode}&translation_id=${selectedTranslationId}`;
      setPlayerUrl(newUrl);
    }
  }, [kodikData, selectedTranslationId, selectedEpisode]);

  if (loading) {
    return (
     <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
       <div className="text-center">
         <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-500 mx-auto mb-4"></div>
         <h2 className="text-xl font-bold text-zinc-400">Ищем плеер...</h2>
         <p className="text-zinc-500">Пожалуйста, подождите.</p>
       </div>
     </div>
   );
 }

  if (!kodikData || !kodikData.link || kodikData.translations.length === 0) {
    return (
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-400">Плеер не найден</h2>
          <p className="text-zinc-500">Не удалось найти источник видео для этого аниме.</p>
        </div>
      </div>
    );
  }

  const selectedTranslation = kodikData.translations.find(t => t.id === selectedTranslationId);
  const episodesCount = selectedTranslation?.episodes_count || 1;
  
  return (
    <div>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          key={playerUrl} // Important: force iframe to re-render when src changes
          src={playerUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Translations Selector */}
      {kodikData.translations.length > 1 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-white">Озвучка</h3>
          <div className="flex flex-wrap gap-2">
            {kodikData.translations.map((translation: KodikTranslation) => (
              <button
                key={translation.id}
                onClick={() => setSelectedTranslationId(translation.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedTranslationId === translation.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
              >
                {translation.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episodes Selector */}
      {episodesCount > 1 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-white">Серии</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            {Array.from({ length: episodesCount }, (_, i) => i + 1).map(epNum => (
              <button
                key={epNum}
                onClick={() => setSelectedEpisode(epNum)}
                className={`flex-shrink-0 w-10 h-10 text-sm font-semibold rounded-md transition-colors ${
                  selectedEpisode === epNum
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
              >
                {epNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
