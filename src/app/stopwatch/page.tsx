"use client";

import { useEffect, useRef, useState } from "react";

function format(ms: number) {
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${h > 0 ? `${pad(h)}:` : ""}${pad(m)}:${pad(s)}.${pad(cs)}`;
}

export default function StopwatchPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef(0);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();
    let raf = 0;
    const tick = () => {
      setElapsed(base.current + (performance.now() - startedAt.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const toggle = () => {
    if (running) {
      base.current = base.current + (performance.now() - startedAt.current);
      setElapsed(base.current);
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    base.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Stopwatch
        </h1>

        <div className="font-mono text-5xl tabular-nums text-zinc-900 sm:text-6xl dark:text-zinc-50">
          {format(elapsed)}
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggle}
            className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
          >
            {running ? "Stop" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          <button
            onClick={() => setLaps((l) => [elapsed, ...l])}
            disabled={!running}
            className="rounded-full border border-zinc-300 px-8 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Lap
          </button>
          <button
            onClick={reset}
            disabled={elapsed === 0}
            className="rounded-full border border-zinc-300 px-8 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
        </div>

        {laps.length > 0 && (
          <ul className="w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {laps.map((lap, i) => (
              <li
                key={laps.length - i}
                className="flex justify-between py-2 font-mono tabular-nums text-zinc-600 dark:text-zinc-400"
              >
                <span>Lap {laps.length - i}</span>
                <span>{format(lap - (laps[i + 1] ?? 0))}</span>
                <span className="text-zinc-400 dark:text-zinc-600">
                  {format(lap)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
