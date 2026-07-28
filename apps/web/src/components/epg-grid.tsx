'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Channel, EpgProgram } from '@/lib/api';
import { gradientCss } from '@/lib/visuals';

const PX_PER_MIN = 2;
const CHANNEL_COL_WIDTH = 168;
const ROW_HEIGHT = 84;
const TOTAL_MINUTES = 24 * 60;

function dayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function minutesSince(reference: Date, date: Date): number {
  return (date.getTime() - reference.getTime()) / 60_000;
}

function formatClock(minutesSinceMidnight: number): string {
  const normalized = ((minutesSinceMidnight % TOTAL_MINUTES) + TOTAL_MINUTES) % TOTAL_MINUTES;
  const h24 = Math.floor(normalized / 60);
  const m = Math.round(normalized % 60);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const start = new Date(startsAt).toLocaleTimeString('es-MX', opts);
  const end = new Date(endsAt).toLocaleTimeString('es-MX', opts);
  return `${start} - ${end}`;
}

interface Selection {
  channel: Channel;
  program: EpgProgram;
}

function isLive(program: EpgProgram, now: Date): boolean {
  return new Date(program.startsAt) <= now && now < new Date(program.endsAt);
}

function currentProgramFor(channel: Channel, now: Date): EpgProgram | undefined {
  return channel.epgPrograms.find((p) => isLive(p, now)) ?? channel.epgPrograms[0];
}

function initialSelection(channels: Channel[]): Selection | null {
  const first = channels[0];
  if (!first) return null;
  const program = currentProgramFor(first, new Date());
  return program ? { channel: first, program } : null;
}

export function EpgGrid({ channels }: { channels: Channel[] }) {
  const [category, setCategory] = useState('Todos');
  const [selected, setSelected] = useState<Selection | null>(() => initialSelection(channels));
  const [now, setNow] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(channels.map((c) => c.category)));
    return ['Todos', ...unique];
  }, [channels]);

  const filteredChannels = useMemo(
    () => (category === 'Todos' ? channels : channels.filter((c) => c.category === category)),
    [channels, category],
  );

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!now || !scrollRef.current) return;
    const offset = minutesSince(dayStart(), now) * PX_PER_MIN;
    scrollRef.current.scrollLeft = Math.max(0, offset - 160);
  }, [now === null]);

  const ticks = useMemo(() => {
    const list: { minutes: number; label: string }[] = [];
    for (let m = 0; m < TOTAL_MINUTES; m += 30) {
      list.push({ minutes: m, label: formatClock(m) });
    }
    return list;
  }, []);

  const nowMinutes = now ? minutesSince(dayStart(), now) : null;
  const gridWidth = CHANNEL_COL_WIDTH + TOTAL_MINUTES * PX_PER_MIN;

  return (
    <div>
      {selected && (
        <div className="relative flex h-[46vw] max-h-[420px] min-h-[300px] w-full items-end overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: gradientCss(selected.channel.id) }}>
            <span className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[18vw] font-black text-white/10">
              {selected.channel.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl px-4 pb-8 sm:px-6 md:px-12">
            {now && isLive(selected.program, now) && (
              <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
                EN VIVO
              </span>
            )}
            <p className="text-sm font-medium text-white/70">
              {selected.channel.name} · {formatTimeRange(selected.program.startsAt, selected.program.endsAt)}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-white drop-shadow sm:text-4xl">
              {selected.program.title}
            </h1>
            {selected.program.description && (
              <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base">
                {selected.program.description}
              </p>
            )}
            <Link
              href={`/canal/${selected.channel.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold text-black transition hover:bg-white/85"
            >
              ▶ Ver canal
            </Link>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto border-b border-white/10 px-4 pt-4 text-sm font-medium sm:px-6 md:px-12 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-none border-b-2 pb-3 transition ${
              category === cat ? 'border-primary text-white' : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
        <div className="relative" style={{ width: gridWidth }}>
          {nowMinutes !== null && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 bg-primary"
              style={{ left: CHANNEL_COL_WIDTH + nowMinutes * PX_PER_MIN }}
            >
              <div className="absolute -left-[5px] -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
          )}

          <div className="sticky top-0 z-30 flex bg-background">
            <div
              className="sticky left-0 z-30 flex-none border-b border-r border-white/10 bg-background"
              style={{ width: CHANNEL_COL_WIDTH }}
            />
            <div className="relative flex-1 border-b border-white/10" style={{ height: 36 }}>
              {ticks.map((t) => (
                <div
                  key={t.minutes}
                  className="absolute top-0 whitespace-nowrap border-l border-white/5 pl-2 pt-2 text-xs text-white/50"
                  style={{ left: t.minutes * PX_PER_MIN }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {filteredChannels.map((channel) => (
            <div key={channel.id} className="flex border-b border-white/5">
              <button
                type="button"
                onMouseEnter={() => {
                  const program = currentProgramFor(channel, now ?? new Date());
                  if (program) setSelected({ channel, program });
                }}
                onFocus={() => {
                  const program = currentProgramFor(channel, now ?? new Date());
                  if (program) setSelected({ channel, program });
                }}
                onClick={() => {
                  const program = currentProgramFor(channel, now ?? new Date());
                  if (program) setSelected({ channel, program });
                }}
                className="sticky left-0 z-10 flex flex-none items-center gap-3 border-r border-white/10 bg-surface px-3 text-left transition hover:bg-white/5"
                style={{ width: CHANNEL_COL_WIDTH, height: ROW_HEIGHT }}
              >
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded text-xs font-bold text-white"
                  style={{ backgroundImage: gradientCss(channel.id) }}
                >
                  {channel.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{channel.name}</p>
                  {channel.isPremium && (
                    <span className="text-[10px] font-bold tracking-wide text-primary">PREMIUM</span>
                  )}
                </div>
              </button>

              <div className="relative" style={{ width: TOTAL_MINUTES * PX_PER_MIN, height: ROW_HEIGHT }}>
                {channel.epgPrograms.map((program) => {
                  const start = minutesSince(dayStart(), new Date(program.startsAt));
                  const end = minutesSince(dayStart(), new Date(program.endsAt));
                  const live = now ? isLive(program, now) : false;
                  const isSelected = selected?.program.id === program.id;

                  return (
                    <button
                      key={program.id}
                      type="button"
                      onMouseEnter={() => setSelected({ channel, program })}
                      onFocus={() => setSelected({ channel, program })}
                      onClick={() => setSelected({ channel, program })}
                      className={`absolute top-0 flex flex-col justify-center overflow-hidden border-r border-background px-3 text-left transition ${
                        isSelected ? 'bg-white/15' : live ? 'bg-primary/20 hover:bg-primary/25' : 'bg-surface hover:bg-white/10'
                      }`}
                      style={{ left: start * PX_PER_MIN, width: (end - start) * PX_PER_MIN, height: ROW_HEIGHT }}
                    >
                      {live && (
                        <span className="mb-1 w-fit rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                          LIVE
                        </span>
                      )}
                      <p className="truncate text-sm font-medium text-white">{program.title}</p>
                      <p className="truncate text-xs text-white/50">
                        {formatTimeRange(program.startsAt, program.endsAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
