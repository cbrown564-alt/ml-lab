import { createHash } from "node:crypto";
import { readdirSync, readFileSync, appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function hostingBaselineUnchanged() {
  const files = ["package.json", "package-lock.json"];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) walk(file);
      else files.push(file);
    }
  };
  walk("src"); walk("content");
  const hash = createHash("sha256");
  for (const file of files.sort()) { hash.update(file); hash.update(readFileSync(file)); }
  const baseline = JSON.parse(readFileSync("scripts/hosting-baseline.json", "utf8"));
  return hash.digest("hex") === baseline.sha256;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const unchanged = hostingBaselineUnchanged();
  console.log(`Authorized hosting migration baseline unchanged: ${unchanged}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `unchanged=${unchanged}\n`);
}
