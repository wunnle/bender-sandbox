// Title screen and the Urban Cafe room.
// The cafe floor plan lives in layout.ts; stat systems in stats.ts.

import {
  Button,
  GAME_HEIGHT,
  GAME_WIDTH,
  Scene,
  SceneContext,
  drawText,
  textWidth,
} from "./engine";
import { drawStatBars } from "./hud";
import { FURNITURE, Rect, SPAWN, Solid, WALLS, interactableNear, overlaps } from "./floorplan";
import { StatKey, Stats } from "./stats";

const PALETTE = {
  wall: "#4a3a63",
  wallTop: "#5d4a7a",
  wallShadow: "#2b2137",
  floor: "#c9c3bd",
  floorAlt: "#bdb6b0",
  grout: "#b6afa9",
  counter: "#f0c020",
  counterTop: "#ffd53d",
  counterShadow: "#a37f0c",
  table: "#5b4746",
  tableTop: "#6d5655",
  ink: "#e8e0d0",
  dim: "#9a8b7a",
  darkInk: "#3a3038",
  accent: "#e9b44c",
  body: "#5b8dd6",
  bodyDark: "#3f68a4",
  skin: "#e0a878",
  hair: "#3a2a22",
};

function centerText(g: CanvasRenderingContext2D, text: string, y: number, color: string) {
  drawText(g, text, Math.round((GAME_WIDTH - textWidth(text)) / 2), y, color);
}

export class TitleScene implements Scene {
  readonly name = "title";
  private t = 0;

  update(dt: number, { input, game }: SceneContext) {
    this.t += dt;
    if (input.justPressed("action")) game.replace(new RoomScene());
  }

  render(g: CanvasRenderingContext2D) {
    g.fillStyle = PALETTE.wallShadow;
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle = PALETTE.wall;
    g.fillRect(40, 24, GAME_WIDTH - 80, 70);

    centerText(g, "URBAN", 44, PALETTE.accent);
    centerText(g, "ADVENTURES", 56, PALETTE.ink);
    centerText(g, "ANOTHER DAY AT THE CAFE", 74, PALETTE.dim);

    if (Math.floor(this.t * 1.6) % 2 === 0) {
      centerText(g, "PRESS SPACE OR TAP", 130, PALETTE.ink);
    }
  }
}

export class RoomScene implements Scene {
  readonly name = "room";

  private x = SPAWN.x;
  private y = SPAWN.y;
  private px = this.x;
  private py = this.y;
  private facing: 1 | -1 = 1;
  private walkPhase = 0;
  private note = "";
  private noteT = 0;
  private clock = 0;

  readonly stats = new Stats({ fun: 55, caffeine: 40, social: 62 });

  /** In-game minutes per real second. */
  private readonly timeScale = 4;
  private readonly speed = 52; // px/sec

  /** Body box in world space, anchored at the feet. */
  private body(x = this.x, y = this.y): Rect {
    return { x: x - 4, y: y - 5, w: 8, h: 5 };
  }

  private blocked(box: Rect) {
    return [...WALLS, ...FURNITURE].some((s) => overlaps(box, s));
  }

  update(dt: number, { input, game }: SceneContext) {
    this.px = this.x;
    this.py = this.y;
    this.clock += dt;
    this.stats.update(dt, this.timeScale);

    const debug: [Button, StatKey, number][] = [
      ["debugFun", "fun", 14],
      ["debugCaffeine", "caffeine", 18],
      ["debugSocial", "social", 12],
    ];
    for (const [button, key, amount] of debug) {
      if (input.justPressed(button)) this.stats.add(key, amount);
    }

    let dx = input.axisX();
    let dy = input.axisY();
    if (dx && dy) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    // Resolve axes separately so a blocked wall still lets you slide along it.
    const stepX = dx * this.speed * dt;
    if (stepX) {
      const nx = clampX(this.x + stepX);
      if (!this.blocked(this.body(nx, this.y))) this.x = nx;
    }
    const stepY = dy * this.speed * dt;
    if (stepY) {
      const ny = clampY(this.y + stepY);
      if (!this.blocked(this.body(this.x, ny))) this.y = ny;
    }

    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
    this.walkPhase = dx || dy ? this.walkPhase + dt * 8 : 0;

    const target = interactableNear(this.body());
    if (input.justPressed("action")) {
      this.note = target ? `${target.prompt} - SOON` : "NOTHING HERE";
      this.noteT = 1.6;
    }
    if (input.justPressed("cancel")) game.replace(new TitleScene());
    if (this.noteT > 0) this.noteT = Math.max(0, this.noteT - dt);
  }

  render(g: CanvasRenderingContext2D, alpha: number) {
    const x = Math.round(this.px + (this.x - this.px) * alpha);
    const y = Math.round(this.py + (this.y - this.py) * alpha);

    // Tiled floor. Grout lines rather than a checker — a checker at this scale
    // reads as a transparency grid.
    g.fillStyle = PALETTE.floor;
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle = PALETTE.grout;
    for (let ty = 0; ty < GAME_HEIGHT; ty += 16) g.fillRect(0, ty, GAME_WIDTH, 1);
    for (let tx = 0; tx < GAME_WIDTH; tx += 16) g.fillRect(tx, 0, 1, GAME_HEIGHT);
    // Flecks so large empty spans aren't dead flat.
    g.fillStyle = PALETTE.floorAlt;
    for (let ty = 8; ty < GAME_HEIGHT; ty += 16) {
      for (let tx = 8; tx < GAME_WIDTH; tx += 16) g.fillRect(tx, ty, 1, 1);
    }

    for (const w of WALLS) {
      g.fillStyle = PALETTE.wall;
      g.fillRect(w.x, w.y, w.w, w.h);
      g.fillStyle = PALETTE.wallTop;
      g.fillRect(w.x, w.y, w.w, 1);
      g.fillStyle = PALETTE.wallShadow;
      g.fillRect(w.x, w.y + w.h - 1, w.w, 1);
    }

    // Doormat in the gap of the bottom wall
    g.fillStyle = "#a89a8c";
    g.fillRect(191, 112, 45, 5);

    const target = interactableNear(this.body());
    for (const f of FURNITURE) drawFurniture(g, f, f === target);

    drawPlayer(g, x, y, this.facing, this.walkPhase);

    if (target) {
      drawText(g, "E", x - 1, y - 24, PALETTE.accent);
    }

    // HUD lives in the open lower area, clear of the counters.
    drawStatBars(g, this.stats, 4, 142, this.clock);
    drawText(g, "URBAN", 232, 11, PALETTE.darkInk);

    if (this.stats.anyCritical() && Math.floor(this.clock * 2) % 2 === 0) {
      centerText(g, "RUNNING ON EMPTY", 132, "#e5544b");
    }

    if (this.noteT > 0) {
      const w = textWidth(this.note) + 6;
      g.fillStyle = "#00000099";
      g.fillRect(Math.round((GAME_WIDTH - w) / 2), 164, w, 11);
      centerText(g, this.note, 167, PALETTE.ink);
    }
  }
}

function drawFurniture(g: CanvasRenderingContext2D, f: Solid, highlighted: boolean) {
  const isCounter = f.kind === "counter";
  const base = isCounter ? PALETTE.counter : PALETTE.table;
  const top = isCounter ? PALETTE.counterTop : PALETTE.tableTop;
  const shadow = isCounter ? PALETTE.counterShadow : "#3f2f2e";

  if (f.round) {
    // Chunky pixel disc: a wide middle band with narrower caps.
    g.fillStyle = base;
    g.fillRect(f.x + 2, f.y, f.w - 4, f.h);
    g.fillRect(f.x, f.y + 2, f.w, f.h - 4);
    g.fillStyle = top;
    g.fillRect(f.x + 3, f.y, f.w - 6, 1);
    g.fillStyle = shadow;
    g.fillRect(f.x + 3, f.y + f.h - 1, f.w - 6, 1);
  } else {
    g.fillStyle = base;
    g.fillRect(f.x, f.y, f.w, f.h);
    g.fillStyle = top;
    g.fillRect(f.x, f.y, f.w, 1);
    g.fillStyle = shadow;
    g.fillRect(f.x, f.y + f.h - 1, f.w, 1);
  }

  if (highlighted) {
    g.fillStyle = PALETTE.ink;
    g.fillRect(f.x - 1, f.y - 1, f.w + 2, 1);
    g.fillRect(f.x - 1, f.y + f.h, f.w + 2, 1);
    g.fillRect(f.x - 1, f.y, 1, f.h);
    g.fillRect(f.x + f.w, f.y, 1, f.h);
  }
}

function drawPlayer(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 1 | -1,
  walkPhase: number,
) {
  const stepping = walkPhase > 0 && Math.floor(walkPhase) % 2 === 0;
  const bob = stepping ? 1 : 0;
  const top = y - bob;

  g.fillStyle = "#00000033";
  g.fillRect(x - 4, y, 8, 2);

  // Legs
  g.fillStyle = PALETTE.bodyDark;
  g.fillRect(x - 3, y - 4, 2, 4);
  g.fillRect(x + 1, y - 4, 2, 4);

  // Torso
  g.fillStyle = PALETTE.body;
  g.fillRect(x - 4, top - 10, 8, 7);
  g.fillStyle = PALETTE.bodyDark;
  g.fillRect(x - 4, top - 4, 8, 1);

  // Head
  g.fillStyle = PALETTE.skin;
  g.fillRect(x - 3, top - 16, 6, 6);
  g.fillStyle = PALETTE.hair;
  g.fillRect(x - 3, top - 17, 6, 2);
  g.fillRect(x - 3 + (facing > 0 ? 3 : 1), top - 14, 1, 1);
}

function clampX(v: number) {
  return Math.min(GAME_WIDTH - 4, Math.max(4, v));
}

function clampY(v: number) {
  return Math.min(GAME_HEIGHT - 1, Math.max(6, v));
}
