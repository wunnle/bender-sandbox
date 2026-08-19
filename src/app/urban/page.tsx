"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Game, fitCanvas } from "./engine";
import { TitleScene } from "./scenes";

const DPAD: { b: Button; label: string; cls: string }[] = [
  { b: "up", label: "▲", cls: "col-start-2 row-start-1" },
  { b: "left", label: "◀", cls: "col-start-1 row-start-2" },
  { b: "right", label: "▶", cls: "col-start-3 row-start-2" },
  { b: "down", label: "▼", cls: "col-start-2 row-start-3" },
];

export default function UrbanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [fps, setFps] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.push(new TitleScene());
    game.start();

    const detachKeys = game.attachKeyboard();

    const resize = () => setScale(fitCanvas(canvas, stage));
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const diag = setInterval(() => setFps(game.fps), 500);

    return () => {
      clearInterval(diag);
      ro.disconnect();
      detachKeys();
      game.stop();
      gameRef.current = null;
    };
  }, []);

  // Touch buttons drive the same Input the keyboard does.
  const hold = (b: Button, down: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    gameRef.current?.input.set(b, down);
  };
  const tap = (b: Button) => (e: React.PointerEvent) => {
    e.preventDefault();
    gameRef.current?.input.tap(b);
  };

  const btn =
    "select-none touch-none rounded-lg bg-white/10 text-lg text-white/80 ring-1 ring-white/15 active:bg-white/25 flex items-center justify-center";

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-neutral-950 p-4 text-white">
      <header className="flex w-full max-w-3xl items-baseline justify-between">
        <h1 className="font-mono text-sm tracking-widest text-amber-400">URBAN ADVENTURES</h1>
        <span className="font-mono text-xs text-white/40">
          320×180 ·{scale}× · {fps} fps
        </span>
      </header>

      <div ref={stageRef} className="flex h-[46vh] w-full max-w-3xl items-center justify-center">
        <canvas
          ref={canvasRef}
          className="bg-black [image-rendering:pixelated]"
          style={{ imageRendering: "pixelated" }}
          onPointerDown={tap("action")}
        />
      </div>

      <div className="flex w-full max-w-md items-center justify-between gap-6 sm:hidden">
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          {DPAD.map(({ b, label, cls }) => (
            <button
              key={b}
              className={`${btn} h-12 w-12 ${cls}`}
              onPointerDown={hold(b, true)}
              onPointerUp={hold(b, false)}
              onPointerLeave={hold(b, false)}
              onPointerCancel={hold(b, false)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className={`${btn} h-14 w-14`} onPointerDown={tap("cancel")}>
            B
          </button>
          <button className={`${btn} h-14 w-14`} onPointerDown={tap("action")}>
            A
          </button>
        </div>
      </div>

      <p className="max-w-md text-center font-mono text-[11px] leading-relaxed text-white/35">
        Engine shell only — fixed 60 Hz timestep, integer-scaled backbuffer, scene stack,
        shared keyboard/touch input. Cafe, stat bars and the day counter come next.
      </p>
    </main>
  );
}
