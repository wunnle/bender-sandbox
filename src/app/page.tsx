import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import EyeLogo from "./EyeLogo";

// Optional blurbs. Anything not listed still shows up, just without a description.
const NOTES: Record<string, string> = {
  dice: "Roll d4 through d100, up to six at a time",
  qr: "Turn any text or URL into a QR code",
  stopwatch: "Stopwatch with laps",
};

// Newest mtime anywhere under the route's directory.
function lastChanged(dir: string): number {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((newest, e) => {
    const full = path.join(dir, e.name);
    const at = e.isDirectory() ? lastChanged(full) : fs.statSync(full).mtimeMs;
    return Math.max(newest, at);
  }, 0);
}

function experiments() {
  const appDir = path.join(process.cwd(), "src/app");
  return fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        !e.name.startsWith("_") &&
        !e.name.startsWith("(") &&
        fs.existsSync(path.join(appDir, e.name, "page.tsx")),
    )
    .map((e) => ({
      name: e.name,
      changed: lastChanged(path.join(appDir, e.name)),
    }))
    .sort((a, b) => b.changed - a.changed || a.name.localeCompare(b.name));
}

const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format;

export default function Home() {
  const routes = experiments();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 p-8">
      <header className="flex items-center gap-4">
        <EyeLogo className="h-24 w-auto shrink-0" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sandbox</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Throwaway experiments. {routes.length} live.
          </p>
          <a
            href="https://kafagoz.com"
            className="mt-1 inline-block text-sm text-neutral-400 underline-offset-4 hover:underline"
          >
            kafagoz.com
          </a>
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {routes.map(({ name, changed }) => (
          <li key={name}>
            <Link
              href={`/${name}`}
              className="group flex items-baseline justify-between gap-4 rounded-xl border border-black/10 px-4 py-3 transition hover:border-black/30 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/30 dark:hover:bg-white/[0.04]"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{name}</span>
                {NOTES[name] && (
                  <span className="text-sm text-neutral-500">{NOTES[name]}</span>
                )}
              </span>
              <span className="flex shrink-0 items-baseline gap-3">
                <time
                  dateTime={new Date(changed).toISOString()}
                  className="text-xs tabular-nums text-neutral-400"
                >
                  {formatDate(new Date(changed))}
                </time>
                <span className="text-neutral-400 transition group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
