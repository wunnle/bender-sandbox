// Urban Adventures — game shell.
// Fixed low-res backbuffer, nearest-neighbour upscale, fixed-timestep loop,
// scene stack, and a unified keyboard/touch input source.

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

const TICK_MS = 1000 / 60;
const MAX_FRAME_MS = 250; // clamp so a backgrounded tab doesn't spiral

export type Button =
  | "up"
  | "down"
  | "left"
  | "right"
  | "action"
  | "cancel"
  // Temporary hooks for nudging stats until real interactions land (BEN-219).
  | "debugFun"
  | "debugCaffeine"
  | "debugSocial";

const BUTTONS: Button[] = [
  "up",
  "down",
  "left",
  "right",
  "action",
  "cancel",
  "debugFun",
  "debugCaffeine",
  "debugSocial",
];

const KEY_MAP: Record<string, Button> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  Space: "action",
  Enter: "action",
  KeyE: "action",
  Escape: "cancel",
  Digit1: "debugFun",
  Digit2: "debugCaffeine",
  Digit3: "debugSocial",
};

/** Edge-detected button state. `held` is this tick, `pressed` is the rising edge. */
export class Input {
  private held = new Set<Button>();
  private prev = new Set<Button>();
  private queued = new Set<Button>();

  isDown(b: Button) {
    return this.held.has(b);
  }

  justPressed(b: Button) {
    return this.held.has(b) && !this.prev.has(b);
  }

  /** Axis helper: -1, 0 or 1. */
  axisX() {
    return (this.isDown("right") ? 1 : 0) - (this.isDown("left") ? 1 : 0);
  }

  axisY() {
    return (this.isDown("down") ? 1 : 0) - (this.isDown("up") ? 1 : 0);
  }

  set(b: Button, down: boolean) {
    if (down) this.held.add(b);
    else this.held.delete(b);
  }

  /** Taps that must survive until the next tick even if released immediately. */
  tap(b: Button) {
    this.queued.add(b);
  }

  beginTick() {
    for (const b of this.queued) this.held.add(b);
  }

  endTick() {
    this.prev = new Set(this.held);
    for (const b of this.queued) this.held.delete(b);
    this.queued.clear();
  }

  releaseAll() {
    for (const b of BUTTONS) this.held.delete(b);
  }
}

export interface SceneContext {
  input: Input;
  game: Game;
}

export interface Scene {
  readonly name: string;
  enter?(ctx: SceneContext): void;
  exit?(ctx: SceneContext): void;
  /** dt is always TICK_MS/1000 — fixed timestep. */
  update(dt: number, ctx: SceneContext): void;
  /** alpha is the 0..1 interpolation into the next tick, for smooth rendering. */
  render(g: CanvasRenderingContext2D, alpha: number): void;
}

export class Game {
  readonly input = new Input();
  readonly ctx: CanvasRenderingContext2D;

  private scenes: Scene[] = [];
  private raf = 0;
  private last = 0;
  private acc = 0;
  private running = false;

  /** Rolling diagnostics for the debug overlay. */
  fps = 0;
  private frames = 0;
  private fpsClock = 0;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    const g = canvas.getContext("2d", { alpha: false });
    if (!g) throw new Error("2d context unavailable");
    g.imageSmoothingEnabled = false;
    this.ctx = g;
  }

  get scene(): Scene | undefined {
    return this.scenes[this.scenes.length - 1];
  }

  private sceneCtx(): SceneContext {
    return { input: this.input, game: this };
  }

  push(scene: Scene) {
    this.scenes.push(scene);
    scene.enter?.(this.sceneCtx());
  }

  pop() {
    const s = this.scenes.pop();
    s?.exit?.(this.sceneCtx());
  }

  replace(scene: Scene) {
    while (this.scenes.length) this.pop();
    this.push(scene);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.acc = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);

    const elapsed = Math.min(now - this.last, MAX_FRAME_MS);
    this.last = now;
    this.acc += elapsed;

    const dt = TICK_MS / 1000;
    while (this.acc >= TICK_MS) {
      this.input.beginTick();
      this.scene?.update(dt, this.sceneCtx());
      this.input.endTick();
      this.acc -= TICK_MS;
    }

    this.ctx.imageSmoothingEnabled = false;
    this.scene?.render(this.ctx, this.acc / TICK_MS);

    this.frames++;
    this.fpsClock += elapsed;
    if (this.fpsClock >= 500) {
      this.fps = Math.round((this.frames * 1000) / this.fpsClock);
      this.frames = 0;
      this.fpsClock = 0;
    }
  };

  /** Wires keyboard + window blur. Returns a teardown fn. */
  attachKeyboard(target: Window = window) {
    const down = (e: KeyboardEvent) => {
      const b = KEY_MAP[e.code];
      if (!b) return;
      e.preventDefault();
      if (!e.repeat) this.input.set(b, true);
    };
    const up = (e: KeyboardEvent) => {
      const b = KEY_MAP[e.code];
      if (!b) return;
      e.preventDefault();
      this.input.set(b, false);
    };
    const blur = () => this.input.releaseAll();

    target.addEventListener("keydown", down as EventListener);
    target.addEventListener("keyup", up as EventListener);
    target.addEventListener("blur", blur);
    return () => {
      target.removeEventListener("keydown", down as EventListener);
      target.removeEventListener("keyup", up as EventListener);
      target.removeEventListener("blur", blur);
    };
  }
}

/** Integer-scale the canvas to fill its container without blurring. */
export function fitCanvas(canvas: HTMLCanvasElement, container: HTMLElement) {
  const scale = Math.max(
    1,
    Math.floor(
      Math.min(container.clientWidth / GAME_WIDTH, container.clientHeight / GAME_HEIGHT),
    ),
  );
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
  return scale;
}

// --- tiny pixel text renderer -------------------------------------------------
// A 3x5 uppercase font, enough for HUD labels until real art lands.

const GLYPHS: Record<string, string> = {
  A: "111101111101101", B: "110101110101110", C: "111100100100111",
  D: "110101101101110", E: "111100110100111", F: "111100110100100",
  G: "111100101101111", H: "101101111101101", I: "111010010010111",
  J: "001001001101111", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "101111111111101", O: "111101101101111",
  P: "111101111100100", Q: "111101101111011", R: "111101110101101",
  S: "111100111001111", T: "111010010010010", U: "101101101101111",
  V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101111010010", Z: "111001010100111",
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111",
  "3": "111001011001111", "4": "101101111001001", "5": "111100111001111",
  "6": "111100111101111", "7": "111001001010010", "8": "111101111101111",
  "9": "111101111001111",
  ".": "000000000000010", ",": "000000000010100", ":": "000010000010000",
  "-": "000000111000000", "/": "001001010100100", "!": "010010010000010",
  "?": "111001011000010", "+": "000010111010000", "%": "101001010100101",
  " ": "000000000000000",
};

export function drawText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = "#e8e0d0",
) {
  g.fillStyle = color;
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const bits = GLYPHS[ch];
    if (bits) {
      for (let i = 0; i < 15; i++) {
        if (bits[i] === "1") g.fillRect(cx + (i % 3), y + Math.floor(i / 3), 1, 1);
      }
    }
    cx += 4;
  }
  return cx - x;
}

export function textWidth(text: string) {
  return text.length * 4 - 1;
}
