import React, { useEffect, useRef } from 'react';
import { AnilibriaResult } from '../services/anilibria';

// @ts-ignore HLS is loaded from a script tag
const Hls = window.Hls;

interface VideoPlayerProps {
  anilibriaData: AnilibriaResult | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ anilibriaData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!anilibriaData || !videoRef.current) return;

    const episodes = anilibriaData.player.episodes;
    const firstEpisodeKey = Object.keys(episodes)[0];
    if (!firstEpisodeKey) {
        console.error("Anilibria: No episodes found in data.");
        return;
    }

    const hlsUrls = episodes[firstEpisodeKey].hls;
    const videoSrc = hlsUrls.fhd || hlsUrls.hd || hlsUrls.sd;

    if (!videoSrc) {
        console.error("Anilibria: No HLS source found for the first episode.");
        return;
    }
    
    const fullVideoSrc = `https://anilibria.tv${videoSrc}`;
    const videoElement = videoRef.current;
    let hls: any;

    if (Hls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(fullVideoSrc);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = fullVideoSrc;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [anilibriaData]);

  if (!anilibriaData) {
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
      <video ref={videoRef} controls className="w-full h-full" />
    </div>
  );
};