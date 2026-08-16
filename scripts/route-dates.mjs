// Records each experiment's last-changed date into src/app/route-dates.json,
// taken from git history rather than file mtimes: Vercel builds from a tarball
// with no .git, and every file's mtime there is the checkout time, so mtimes
// would read as one identical deploy timestamp.
//
// Not run at build time. The route-dates workflow runs this on push to main and
// commits the result, so the committed JSON is what ships.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "src/app");
const outFile = path.join(appDir, "route-dates.json");

const routes = fs
  .readdirSync(appDir, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith("_") &&
      !e.name.startsWith("(") &&
      fs.existsSync(path.join(appDir, e.name, "page.tsx")),
  )
  .map((e) => e.name)
  .sort();

const dates = {};
for (const name of routes) {
  const iso = execFileSync(
    "git",
    ["log", "-1", "--format=%cI", "--", `src/app/${name}`],
    { encoding: "utf8" },
  ).trim();
  if (iso) dates[name] = iso;
}

fs.writeFileSync(outFile, `${JSON.stringify(dates, null, 2)}\n`);
console.log(`route-dates: wrote ${Object.keys(dates).length} entries`);
