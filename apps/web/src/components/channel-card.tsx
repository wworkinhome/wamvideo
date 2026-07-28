'use client';

import Link from 'next/link';
import { Channel } from '@/lib/api';
import { gradientCss } from '@/lib/visuals';
import { useHoverPreview } from '@/hooks/use-hover-preview';

export function ChannelCard({ channel }: { channel: Channel }) {
  const { videoRef, previewing, start, stop } = useHoverPreview(channel.streamUrl);

  return (
    <Link
      href={`/canal/${channel.slug}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-md bg-surface shadow-lg ring-1 ring-white/5 transition-transform duration-300 ease-out hover:z-20 hover:scale-105 hover:shadow-2xl"
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      {channel.logoUrl ? (
        <div
          className={`flex h-full w-full items-center justify-center p-4 transition-opacity duration-300 ${previewing ? 'opacity-0' : ''}`}
          style={{ backgroundImage: gradientCss(channel.id) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={channel.logoUrl} alt={channel.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center p-3 text-center transition-opacity duration-300 ${previewing ? 'opacity-0' : ''}`}
          style={{ backgroundImage: gradientCss(channel.id) }}
        >
          <span className="line-clamp-2 text-center text-sm font-bold leading-tight text-white drop-shadow-md">
            {channel.name}
          </span>
        </div>
      )}

      {channel.streamUrl && (
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            previewing ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      )}

      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        EN VIVO
      </span>
      {channel.isPremium && (
        <span className="absolute right-1.5 top-1.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
          PREMIUM
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="truncate text-xs font-semibold text-white">{channel.name}</p>
        {channel.category && <p className="truncate text-[10px] text-white/60">{channel.category}</p>}
      </div>
    </Link>
  );
}
