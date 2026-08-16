// Records the last-changed date of each experiment into src/app/route-dates.json.
//
// This runs as `prebuild` and the result is committed, because Vercel builds
// from a tarball with no .git directory — git history is only available here on
// the machine that pushes. Where git isn't available we keep whatever is already
// committed rather than clobbering it with nothing.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "src/app");
const outFile = path.join(appDir, "route-dates.json");

function gitAvailable() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!gitAvailable()) {
  console.log("route-dates: no git repo, keeping committed dates");
  process.exit(0);
}

const routes = fs
  .readdirSync(appDir, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith("_") &&
      !e.name.startsWith("(") &&
      fs.existsSync(path.join(appDir, e.name, "page.tsx")),
  )
  .map((e) => e.name);

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
