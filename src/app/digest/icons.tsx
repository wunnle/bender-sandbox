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

/** Wrench — harnesses, agent config, MCP, observability */
function Tooling({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M14.7 6.3a4 4 0 0 0 5 5L15 16l-3.5 3.5a2.1 2.1 0 0 1-3-3L12 13 7.3 8.3a4 4 0 0 0-5-5" />
      <path d="M2.3 3.3 6 7l1-1-3.7-3.7" />
    </svg>
  );
}

/** Checklist — does it actually work, and how would you know */
function Evals({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 6.5 6 8.5 9.5 5" />
      <path d="M4 17.5 6 19.5 9.5 16" />
      <path d="M13 7h7M13 18h7" />
    </svg>
  );
}

/** Two stacked bars — comparing models side by side */
function Models({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="5.5" rx="1.6" />
      <rect x="3" y="13.5" width="11" height="5.5" rx="1.6" />
    </svg>
  );
}

/** Open book — craft, criticism, how the work changes */
function Practice({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 6.5C10.5 5.2 8.6 4.5 6 4.5H3v13h3c2.6 0 4.5.7 6 2" />
      <path d="M12 6.5c1.5-1.3 3.4-2 6-2h3v13h-3c-2.6 0-4.5.7-6 2Z" />
      <path d="M12 6.5v15" />
    </svg>
  );
}

export const CATEGORY_ICON: Record<Category, (p: Props) => React.ReactElement> = {
  tooling: Tooling,
  evals: Evals,
  models: Models,
  practice: Practice,
};
