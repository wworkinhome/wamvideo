'use client';

import { useRef } from 'react';
import { ThumbCard, ThumbItem } from './thumb-card';

export function Row({ title, items }: { title: string; items: ThumbItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return null;
  }

  const scrollBy = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * 700, behavior: 'smooth' });
  };

  return (
    <section className="group/row relative py-3">
      <h2 className="mb-2 px-4 text-base font-semibold text-white sm:text-lg md:px-12">{title}</h2>
      <div className="relative">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent text-2xl text-white opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-1.5 overflow-x-scroll scroll-smooth px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:px-12 md:gap-2 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div key={item.id} className="w-[42vw] flex-none sm:w-[240px]">
              <ThumbCard item={item} />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent text-2xl text-white opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
