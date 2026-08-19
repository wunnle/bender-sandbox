// Pixel HUD for the three stat bars.

import { drawText } from "./engine";
import { CRITICAL, MAX, STAT_DEFS, STAT_KEYS, Stats } from "./stats";

const BAR_W = 46;
const BAR_H = 5;
const ROW_H = 10;
const LABEL_W = 14;

const FRAME = "#1b1524";
const TRACK = "#332941";
const INK = "#e8e0d0";
const WARN = "#e5544b";

/**
 * Draws the stat panel with its top-left at (x, y).
 * `t` is a free-running clock in seconds, used for the critical blink.
 */
export function drawStatBars(
  g: CanvasRenderingContext2D,
  stats: Stats,
  x: number,
  y: number,
  t: number,
) {
  const w = LABEL_W + BAR_W + 6;
  const h = STAT_KEYS.length * ROW_H + 4;

  g.fillStyle = FRAME;
  g.fillRect(x, y, w, h);

  STAT_KEYS.forEach((key, i) => {
    const def = STAT_DEFS[key];
    const rowY = y + 3 + i * ROW_H;
    const barX = x + LABEL_W;
    const critical = stats.isCritical(key);
    const blink = critical && Math.floor(t * 4) % 2 === 0;

    drawText(g, def.label, x + 2, rowY, critical ? (blink ? WARN : INK) : INK);

    g.fillStyle = TRACK;
    g.fillRect(barX, rowY, BAR_W, BAR_H);

    // Trailing shadow shows where the value was a moment ago.
    const value = stats.get(key);
    const shown = stats.display(key);
    const fillW = Math.round((value / MAX) * BAR_W);
    const shownW = Math.round((shown / MAX) * BAR_W);

    if (shownW > fillW) {
      g.fillStyle = def.shadow;
      g.fillRect(barX, rowY, shownW, BAR_H);
    }

    const pulse = stats.pulse(key);
    g.fillStyle =
      pulse > 0 && Math.floor(pulse * 20) % 2 === 0
        ? stats.pulseDir(key) > 0
          ? INK
          : WARN
        : critical && blink
          ? WARN
          : def.color;
    g.fillRect(barX, rowY, Math.max(value > 0 ? 1 : 0, fillW), BAR_H);

    if (shownW < fillW) {
      // Gaining: draw the incoming segment brighter than the settled part.
      g.fillStyle = INK;
      g.fillRect(barX + shownW, rowY, fillW - shownW, BAR_H);
    }

    // Critical tick mark on the track
    g.fillStyle = critical ? WARN : "#4a3c5c";
    g.fillRect(barX + Math.round((CRITICAL / MAX) * BAR_W), rowY + BAR_H, 1, 1);
  });
}

export function statPanelSize() {
  return { w: LABEL_W + BAR_W + 6, h: STAT_KEYS.length * ROW_H + 4 };
}
