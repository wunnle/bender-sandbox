"use client";

import { useState } from "react";

const SIDES = [4, 6, 8, 10, 12, 20, 100];

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

function roll(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function Die({ value, sides, rolling }: { value: number; sides: number; rolling: boolean }) {
  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/10 transition-transform dark:bg-neutral-100 ${
        rolling ? "animate-spin" : ""
      }`}
    >
      {sides === 6 ? (
        <svg viewBox="0 0 100 100" className="h-full w-full p-2">
          {PIPS[value].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={9} className="fill-neutral-900" />
          ))}
        </svg>
      ) : (
        <span className="text-3xl font-semibold tabular-nums text-neutral-900">{value}</span>
      )}
    </div>
  );
}

export default function DicePage() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [values, setValues] = useState<number[]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ total: number; label: string }[]>([]);

  const total = values.reduce((a, b) => a + b, 0);

  function doRoll(nextSides = sides, nextCount = count) {
    setRolling(true);
    const spin = setInterval(
      () => setValues(Array.from({ length: nextCount }, () => roll(nextSides))),
      70,
    );
    setTimeout(() => {
      clearInterval(spin);
      const result = Array.from({ length: nextCount }, () => roll(nextSides));
      setValues(result);
      setRolling(false);
      setHistory((h) =>
        [{ total: result.reduce((a, b) => a + b, 0), label: `${nextCount}d${nextSides}` }, ...h].slice(0, 12),
      );
    }, 600);
  }

  function changeCount(n: number) {
    const next = Math.min(6, Math.max(1, n));
    setCount(next);
    setValues(Array.from({ length: next }, (_, i) => values[i] ?? 1));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-950 p-6 text-neutral-100">
      <h1 className="text-sm uppercase tracking-[0.3em] text-neutral-500">Dice Roller</h1>

      <div className="flex flex-wrap items-center justify-center gap-4" style={{ minHeight: "6rem" }}>
        {values.map((v, i) => (
          <Die key={i} value={v} sides={sides} rolling={rolling} />
        ))}
      </div>

      <div className="text-center">
        <div className="text-5xl font-bold tabular-nums">{total}</div>
        <div className="mt-1 text-xs text-neutral-500">
          {count}d{sides}
          {count > 1 && !rolling ? ` · ${values.join(" + ")}` : ""}
        </div>
      </div>

      <button
        onClick={() => doRoll()}
        disabled={rolling}
        className="rounded-full bg-emerald-500 px-10 py-3 text-lg font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        Roll
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {SIDES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSides(s);
              doRoll(s);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              s === sides
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            d{s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => changeCount(count - 1)}
          className="h-9 w-9 rounded-lg bg-neutral-800 text-lg hover:bg-neutral-700"
        >
          −
        </button>
        <span className="w-20 text-center text-sm text-neutral-400">
          {count} {count === 1 ? "die" : "dice"}
        </span>
        <button
          onClick={() => changeCount(count + 1)}
          className="h-9 w-9 rounded-lg bg-neutral-800 text-lg hover:bg-neutral-700"
        >
          +
        </button>
      </div>

      {history.length > 0 && (
        <div className="flex max-w-md flex-wrap justify-center gap-2 text-xs text-neutral-500">
          {history.map((h, i) => (
            <span key={i} className="rounded bg-neutral-900 px-2 py-1 tabular-nums">
              {h.label}: <span className="text-neutral-300">{h.total}</span>
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
