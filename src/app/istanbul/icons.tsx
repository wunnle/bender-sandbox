import type { Category } from "./data";

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Theatre mask — theatre, stand-up, musicals */
function Stage({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 4h16v7a8 8 0 0 1-16 0V4Z" />
      <path d="M9 9h.01M15 9h.01" />
      <path d="M9.5 13.5a3.5 3.5 0 0 0 5 0" />
    </svg>
  );
}

/** Music note — concerts, festivals */
function Music({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

/** Film strip — open-air cinema */
function Screen({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M2 12h20M2 7.5h5M2 16.5h5M17 7.5h5M17 16.5h5" />
    </svg>
  );
}

/** Sailboat — sailing, anything on the water */
function Outdoors({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
      <path d="M21 14 10 2 3 14h18Z" />
      <path d="M10 2v12" />
    </svg>
  );
}

export const CATEGORY_ICON: Record<Category, (p: Props) => React.ReactElement> = {
  stage: Stage,
  music: Music,
  screen: Screen,
  outdoors: Outdoors,
};
