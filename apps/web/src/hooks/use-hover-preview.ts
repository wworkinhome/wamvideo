'use client';

import { useRef, useState } from 'react';

const HOVER_INTENT_MS = 350;

// Reproduce un video (m3u8) muteado dentro de una tarjeta al pasar el mouse, con un
// pequeño retraso para no cargar streams solo por pasar de largo con el cursor.
export function useHoverPreview(videoUrl: string | null | undefined) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewing, setPreviewing] = useState(false);

  function stop() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    setPreviewing(false);
  }

  function start() {
    if (!videoUrl) return;
    hoverTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;

      video.addEventListener('playing', () => setPreviewing(true), { once: true });

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.play().catch(() => {});
      } else {
        import('hls.js').then(({ default: Hls }) => {
          if (!Hls.isSupported()) return;
          const hls = new Hls();
          hlsRef.current = hls;
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) stop();
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
        });
      }
    }, HOVER_INTENT_MS);
  }

  return { videoRef, previewing, start, stop };
}
