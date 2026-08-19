// The three meters that drive Urban Adventures.
// Values are 0..100. Decay runs continuously through the in-game day; the
// interactions that push them back up land in BEN-219.

export const STAT_KEYS = ["fun", "caffeine", "social"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const CRITICAL = 15;
export const MAX = 100;

export interface StatDef {
  key: StatKey;
  label: string;
  /** Points lost per in-game minute. */
  decay: number;
  color: string;
  /** Slightly darker shade used for the lost portion of the bar. */
  shadow: string;
}

export const STAT_DEFS: Record<StatKey, StatDef> = {
  fun: { key: "fun", label: "FUN", decay: 0.06, color: "#e9b44c", shadow: "#7a5a20" },
  caffeine: { key: "caffeine", label: "CAF", decay: 0.09, color: "#c96f4a", shadow: "#6b3421" },
  social: { key: "social", label: "SOC", decay: 0.05, color: "#5b8dd6", shadow: "#2c4670" },
};

interface StatState {
  /** Authoritative value. */
  value: number;
  /** Value the bar is currently drawing; eases toward `value`. */
  display: number;
  /** Seconds of highlight left after a gain or loss, for the flash effect. */
  pulse: number;
  /** +1 for a recent gain, -1 for a recent hit. */
  pulseDir: number;
}

export class Stats {
  private state: Record<StatKey, StatState>;

  constructor(initial: Partial<Record<StatKey, number>> = {}) {
    this.state = {} as Record<StatKey, StatState>;
    for (const key of STAT_KEYS) {
      const v = clamp(initial[key] ?? 60);
      this.state[key] = { value: v, display: v, pulse: 0, pulseDir: 0 };
    }
  }

  get(key: StatKey) {
    return this.state[key].value;
  }

  display(key: StatKey) {
    return this.state[key].display;
  }

  pulse(key: StatKey) {
    return this.state[key].pulse;
  }

  pulseDir(key: StatKey) {
    return this.state[key].pulseDir;
  }

  isCritical(key: StatKey) {
    return this.state[key].value < CRITICAL;
  }

  /** Any stat in the danger zone — the HUD nags harder when true. */
  anyCritical() {
    return STAT_KEYS.some((k) => this.isCritical(k));
  }

  snapshot(): Record<StatKey, number> {
    return { fun: this.get("fun"), caffeine: this.get("caffeine"), social: this.get("social") };
  }

  /** Apply a delta and kick off the flash. Returns the clamped amount actually applied. */
  add(key: StatKey, amount: number) {
    const s = this.state[key];
    const next = clamp(s.value + amount);
    const applied = next - s.value;
    s.value = next;
    if (applied !== 0) {
      s.pulse = 0.45;
      s.pulseDir = applied > 0 ? 1 : -1;
    }
    return applied;
  }

  /** Overnight / event decay with no flash. */
  drain(key: StatKey, amount: number) {
    this.state[key].value = clamp(this.state[key].value - amount);
  }

  /**
   * @param dt real seconds since last tick
   * @param minutesPerSecond how fast the in-game clock runs
   */
  update(dt: number, minutesPerSecond: number) {
    const minutes = dt * minutesPerSecond;
    for (const key of STAT_KEYS) {
      const s = this.state[key];
      s.value = clamp(s.value - STAT_DEFS[key].decay * minutes);

      // Ease the drawn value toward the real one so changes read as motion.
      const gap = s.value - s.display;
      if (Math.abs(gap) < 0.15) s.display = s.value;
      else s.display += gap * Math.min(1, dt * 9);

      if (s.pulse > 0) {
        s.pulse = Math.max(0, s.pulse - dt);
        if (s.pulse === 0) s.pulseDir = 0;
      }
    }
  }
}

function clamp(v: number) {
  return Math.min(MAX, Math.max(0, v));
}
