// Writes public/version.json from package.json so a running tab can notice a new build.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const out = { version: pkg.version, builtAt: new Date().toISOString() };
mkdirSync(new URL("../public", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/version.json", import.meta.url), JSON.stringify(out) + "\n");
console.log("version.json", out);
