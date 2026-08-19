// Placeholder scenes proving the shell works: a title screen and a walkable room.
// The real Urban Cafe art and stat systems land in later issues.

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  Scene,
  SceneContext,
  drawText,
  textWidth,
} from "./engine";

const PALETTE = {
  wall: "#2b2137",
  floor: "#4a3b3b",
  floorAlt: "#443636",
  trim: "#7a5b46",
  ink: "#e8e0d0",
  dim: "#9a8b7a",
  accent: "#e9b44c",
  body: "#5b8dd6",
  skin: "#e0a878",
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
    g.fillStyle = PALETTE.wall;
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Window light behind the title
    g.fillStyle = "#3a2c4a";
    g.fillRect(40, 24, GAME_WIDTH - 80, 70);

    centerText(g, "URBAN", 44, PALETTE.accent);
    centerText(g, "ADVENTURES", 56, PALETTE.ink);
    centerText(g, "DAY 1 AT THE CAFE", 74, PALETTE.dim);

    if (Math.floor(this.t * 1.6) % 2 === 0) {
      centerText(g, "PRESS SPACE OR TAP", 130, PALETTE.ink);
    }
    centerText(g, "SHELL BUILD - BEN-216", 158, PALETTE.dim);
  }
}

export class RoomScene implements Scene {
  readonly name = "room";

  // Position is kept in floats; rendering snaps to whole pixels.
  private x = GAME_WIDTH / 2;
  private y = 120;
  private px = this.x;
  private py = this.y;
  private facing: 1 | -1 = 1;
  private walkPhase = 0;
  private note = "";
  private noteT = 0;

  private readonly speed = 52; // px/sec
  private readonly bounds = { left: 12, right: GAME_WIDTH - 12, top: 96, bottom: GAME_HEIGHT - 14 };

  update(dt: number, { input, game }: SceneContext) {
    this.px = this.x;
    this.py = this.y;

    let dx = input.axisX();
    let dy = input.axisY();
    if (dx && dy) {
      const inv = Math.SQRT1_2;
      dx *= inv;
      dy *= inv;
    }

    this.x = Math.min(this.bounds.right, Math.max(this.bounds.left, this.x + dx * this.speed * dt));
    this.y = Math.min(this.bounds.bottom, Math.max(this.bounds.top, this.y + dy * this.speed * dt));

    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
    this.walkPhase = dx || dy ? this.walkPhase + dt * 8 : 0;

    if (input.justPressed("action")) {
      this.note = this.nearCounter() ? "COFFEE COMES LATER" : "NOTHING HERE YET";
      this.noteT = 1.6;
    }
    if (input.justPressed("cancel")) game.replace(new TitleScene());

    if (this.noteT > 0) this.noteT = Math.max(0, this.noteT - dt);
  }

  private nearCounter() {
    return this.y < 112 && this.x > 90 && this.x < 230;
  }

  render(g: CanvasRenderingContext2D, alpha: number) {
    const x = Math.round(this.px + (this.x - this.px) * alpha);
    const y = Math.round(this.py + (this.y - this.py) * alpha);

    g.fillStyle = PALETTE.wall;
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Window
    g.fillStyle = "#3d3358";
    g.fillRect(24, 20, 88, 44);
    g.fillStyle = "#5a4f7d";
    g.fillRect(26, 22, 84, 40);
    g.fillStyle = "#3d3358";
    g.fillRect(67, 22, 2, 40);

    // Sign
    drawText(g, "URBAN", 200, 30, PALETTE.accent);

    // Floor with a checker so movement is legible
    for (let ty = 88; ty < GAME_HEIGHT; ty += 8) {
      for (let tx = 0; tx < GAME_WIDTH; tx += 8) {
        g.fillStyle = ((tx + ty) / 8) % 2 === 0 ? PALETTE.floor : PALETTE.floorAlt;
        g.fillRect(tx, ty, 8, 8);
      }
    }

    // Counter
    g.fillStyle = PALETTE.trim;
    g.fillRect(90, 76, 140, 14);
    g.fillStyle = "#5f4636";
    g.fillRect(90, 88, 140, 4);

    // Player: 8x14 blob, bobs while walking
    const bob = this.walkPhase > 0 && Math.floor(this.walkPhase) % 2 === 0 ? 1 : 0;
    const py = y - bob;
    g.fillStyle = "#00000040";
    g.fillRect(x - 4, y + 1, 8, 2);
    g.fillStyle = PALETTE.body;
    g.fillRect(x - 4, py - 8, 8, 8);
    g.fillStyle = PALETTE.skin;
    g.fillRect(x - 3, py - 14, 6, 6);
    g.fillStyle = "#2b2137";
    g.fillRect(x - 3 + (this.facing > 0 ? 3 : 0), py - 12, 1, 1);

    if (this.nearCounter()) {
      drawText(g, "E", x - 1, py - 22, PALETTE.accent);
    }

    if (this.noteT > 0) {
      const w = textWidth(this.note) + 6;
      g.fillStyle = "#00000099";
      g.fillRect(Math.round((GAME_WIDTH - w) / 2), 152, w, 11);
      centerText(g, this.note, 155, PALETTE.ink);
    }

    drawText(g, "MOVE: ARROWS  ACT: E  BACK: ESC", 6, 6, PALETTE.dim);
  }
}
