import React from 'react';
import { KodikSearchResult } from '../types';

interface VideoPlayerProps {
  kodikData: KodikSearchResult | null;
  loading: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ kodikData, loading }) => {
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

  if (!kodikData || !kodikData.link) {
    return (
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-400">Плеер не найден</h2>
          <p className="text-zinc-500">Не удалось найти источник видео для этого аниме.</p>
        </div>
      </div>
    );
  }

  // Kodik-ссылки часто начинаются с "//", что требует добавления протокола
  const playerUrl = kodikData.link.startsWith('//') ? `https:${kodikData.link}` : kodikData.link;

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={playerUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};