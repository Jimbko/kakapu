import React from 'react';

interface VideoPlayerProps {
  playerUrl: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ playerUrl }) => {
  if (!playerUrl) {
    return (
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-400">Плеер не найден</h2>
          <p className="text-zinc-500">Не удалось найти источник видео для этого аниме.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={playerUrl}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};
