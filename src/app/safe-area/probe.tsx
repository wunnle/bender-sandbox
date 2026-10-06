"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Reading = {
  insetTop: number;
  insetBottom: number;
  insetLeft: number;
  insetRight: number;
  vh: number;
  svh: number;
  lvh: number;
  dvh: number;
  innerWidth: number;
  innerHeight: number;
  clientHeight: number;
  vvHeight: number;
  vvWidth: number;
  vvOffsetTop: number;
  vvScale: number;
  fixedBottom: number;
  screenWidth: number;
  screenHeight: number;
  availHeight: number;
  dpr: number;
  scrollY: number;
  standalone: boolean;
  orientation: string;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

function px(el: HTMLElement | null, prop: string) {
  if (!el) return 0;
  return parseFloat(getComputedStyle(el).getPropertyValue(prop)) || 0;
}

function h(el: HTMLElement | null) {
  return el ? el.getBoundingClientRect().height : 0;
}

export default function SafeAreaProbe() {
  const insets = useRef<HTMLDivElement>(null);
  const vhRef = useRef<HTMLDivElement>(null);
  const svhRef = useRef<HTMLDivElement>(null);
  const lvhRef = useRef<HTMLDivElement>(null);
  const dvhRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [r, setR] = useState<Reading | null>(null);
  const [range, setRange] = useState<{ min: number; max: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const measure = useCallback(() => {
    const vv = window.visualViewport;
    const nav = navigator as Navigator & { standalone?: boolean };
    const next: Reading = {
      insetTop: px(insets.current, "padding-top"),
      insetBottom: px(insets.current, "padding-bottom"),
      insetLeft: px(insets.current, "padding-left"),
      insetRight: px(insets.current, "padding-right"),
      vh: h(vhRef.current),
      svh: h(svhRef.current),
      lvh: h(lvhRef.current),
      dvh: h(dvhRef.current),
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientHeight: document.documentElement.clientHeight,
      vvHeight: vv?.height ?? window.innerHeight,
      vvWidth: vv?.width ?? window.innerWidth,
      vvOffsetTop: vv?.offsetTop ?? 0,
      vvScale: vv?.scale ?? 1,
      fixedBottom: bottomRef.current?.getBoundingClientRect().top ?? 0,
      screenWidth: screen.width,
      screenHeight: screen.height,
      availHeight: screen.availHeight,
      dpr: window.devicePixelRatio,
      scrollY: window.scrollY,
      standalone:
        nav.standalone === true || matchMedia("(display-mode: standalone)").matches,
      orientation: screen.orientation?.type ?? (innerWidth > innerHeight ? "landscape" : "portrait"),
    };
    setR(next);
    setRange((prev) =>
      prev
        ? { min: Math.min(prev.min, next.vvHeight), max: Math.max(prev.max, next.vvHeight) }
        : { min: next.vvHeight, max: next.vvHeight },
    );
  }, []);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    const vv = window.visualViewport;
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule);
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    // Safari settles toolbar sizes a beat after load.
    const t = setTimeout(schedule, 500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
    };
  }, [measure]);

  const copy = async () => {
    if (!r) return;
    await navigator.clipboard.writeText(
      JSON.stringify({ ...r, vvHeightRange: range, ua: navigator.userAgent }, null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Browser chrome currently covering the large viewport (top + bottom bars).
  const chromeNow = r ? r1(r.lvh - r.vvHeight * r.vvScale) : 0;
  const chromeCollapsible = r ? r1(r.lvh - r.svh) : 0;
  const hiddenBelow = r ? r1(r.screenHeight - r.vvOffsetTop - r.vvHeight) : 0;

  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100 font-mono text-[13px]">
      {/* Hidden probes */}
      <div
        ref={insets}
        aria-hidden
        className="fixed invisible pointer-events-none"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      />
      <div ref={vhRef} aria-hidden className="fixed top-0 left-0 w-px invisible" style={{ height: "100vh" }} />
      <div ref={svhRef} aria-hidden className="fixed top-0 left-0 w-px invisible" style={{ height: "100svh" }} />
      <div ref={lvhRef} aria-hidden className="fixed top-0 left-0 w-px invisible" style={{ height: "100lvh" }} />
      <div ref={dvhRef} aria-hidden className="fixed top-0 left-0 w-px invisible" style={{ height: "100dvh" }} />
      <div ref={bottomRef} aria-hidden className="fixed bottom-0 left-0 w-px h-0 invisible" />

      {/* Overlays */}
      <div
        className="fixed inset-x-0 top-0 z-40 pointer-events-none bg-rose-500/45 border-b border-rose-400 flex items-end justify-center"
        style={{ height: "env(safe-area-inset-top)" }}
      >
        <span className="text-[10px] text-white/90 pb-0.5">top {r?.insetTop ?? "–"}px</span>
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-none bg-sky-500/45 border-t border-sky-400 flex items-start justify-center"
        style={{ height: "env(safe-area-inset-bottom)" }}
      >
        <span className="text-[10px] text-white/90 pt-0.5">bottom {r?.insetBottom ?? "–"}px</span>
      </div>
      <div
        className="fixed inset-y-0 left-0 z-40 pointer-events-none bg-amber-500/40"
        style={{ width: "env(safe-area-inset-left)" }}
      />
      <div
        className="fixed inset-y-0 right-0 z-40 pointer-events-none bg-amber-500/40"
        style={{ width: "env(safe-area-inset-right)" }}
      />
      {r && (
        <>
          <Line y={r.svh} color="border-yellow-400" label={`100svh · ${r1(r.svh)}`} />
          <Line y={r.vvOffsetTop + r.vvHeight} color="border-emerald-400" label={`visible bottom · ${r1(r.vvOffsetTop + r.vvHeight)}`} />
        </>
      )}

      <main
        className="relative"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingLeft: "calc(env(safe-area-inset-left) + 16px)",
          paddingRight: "calc(env(safe-area-inset-right) + 16px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-sans text-xl font-semibold">Safe area</h1>
            <p className="text-zinc-400 font-sans text-sm">
              {r ? (r.standalone ? "Home-screen app (standalone)" : "In browser tab") : "measuring…"}
              {r && ` · ${r.orientation}`}
            </p>
          </div>
          <button
            onClick={copy}
            className="rounded-lg bg-zinc-800 px-3 py-2 font-sans text-sm active:bg-zinc-700"
          >
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </header>

        <Section title="Safe-area insets · env()">
          <Row k="top (status bar / island)" v={r?.insetTop} swatch="bg-rose-500" />
          <Row k="bottom (home indicator)" v={r?.insetBottom} swatch="bg-sky-500" />
          <Row k="left" v={r?.insetLeft} swatch="bg-amber-500" />
          <Row k="right" v={r?.insetRight} swatch="bg-amber-500" />
        </Section>

        <Section title="Browser bars (derived)">
          <Row k="chrome covering now" v={chromeNow} hint="100lvh − visualViewport.height" />
          <Row k="collapsible chrome" v={chromeCollapsible} hint="100lvh − 100svh" />
          <Row k="screen below visible area" v={hiddenBelow} hint="screen.height − vv.offsetTop − vv.height" />
          <Row
            k="visible height range"
            v={range ? `${r1(range.min)} – ${r1(range.max)}` : undefined}
            hint="min/max seen this session; scroll to collapse bars"
          />
        </Section>

        <Section title="Viewport units">
          <Row k="100vh" v={r && r1(r.vh)} />
          <Row k="100svh (small, bars shown)" v={r && r1(r.svh)} swatch="bg-yellow-400" />
          <Row k="100lvh (large, bars hidden)" v={r && r1(r.lvh)} />
          <Row k="100dvh (dynamic)" v={r && r1(r.dvh)} />
        </Section>

        <Section title="Window & visual viewport">
          <Row k="innerWidth × innerHeight" v={r && `${r.innerWidth} × ${r.innerHeight}`} />
          <Row k="documentElement.clientHeight" v={r?.clientHeight} />
          <Row k="fixed bottom:0 lands at y" v={r && r1(r.fixedBottom)} />
          <Row k="visualViewport w × h" v={r && `${r1(r.vvWidth)} × ${r1(r.vvHeight)}`} />
          <Row k="visualViewport offsetTop" v={r && r1(r.vvOffsetTop)} swatch="bg-emerald-400" />
          <Row k="visualViewport scale" v={r && r1(r.vvScale)} />
          <Row k="scrollY" v={r && Math.round(r.scrollY)} />
        </Section>

        <Section title="Screen">
          <Row k="screen w × h" v={r && `${r.screenWidth} × ${r.screenHeight}`} />
          <Row k="screen.availHeight" v={r?.availHeight} />
          <Row k="devicePixelRatio" v={r?.dpr} />
        </Section>

        <p className="font-sans text-sm text-zinc-400 mt-6 leading-relaxed">
          Red/blue bands are <code>env(safe-area-inset-*)</code>. Yellow line is 100svh, green line is the
          bottom of what you can actually see. Scroll down so Safari shrinks its bars, and the numbers
          update live. Add to Home Screen to compare standalone mode.
        </p>

        <div className="mt-8 space-y-2">
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} className="h-10 rounded-lg bg-zinc-900 flex items-center px-3 text-zinc-500">
              scroll filler {i + 1}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Line({ y, color, label }: { y: number; color: string; label: string }) {
  return (
    <div
      className={`fixed inset-x-0 z-30 pointer-events-none border-t-2 border-dashed ${color}`}
      style={{ top: y - 1 }}
    >
      <span className="absolute right-2 -top-4 text-[10px] bg-black/70 px-1 rounded">{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
      <h2 className="px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-sans">
        {title}
      </h2>
      <div className="divide-y divide-zinc-800">{children}</div>
    </section>
  );
}

function Row({
  k,
  v,
  hint,
  swatch,
}: {
  k: string;
  v: number | string | null | undefined;
  hint?: string;
  swatch?: string;
}) {
  return (
    <div className="px-3 py-2 flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {swatch && <span className={`inline-block size-2.5 rounded-sm ${swatch}`} />}
          <span className="text-zinc-300">{k}</span>
        </div>
        {hint && <div className="text-[11px] text-zinc-500">{hint}</div>}
      </div>
      <span className="tabular-nums text-zinc-50 shrink-0">
        {v === undefined || v === null ? "–" : typeof v === "number" ? `${v}px` : v}
      </span>
    </div>
  );
}
