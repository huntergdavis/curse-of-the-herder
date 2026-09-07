// Probe renderer-hook kinds at level 0: npx tsx scripts/probe-kind.ts
import { generateMap } from "../src/core/map/generate";
import { createWorld } from "../src/core/sim/state";
import { speakKind } from "../src/core/lang/speech";
const map = generateMap("probe", { size: 128 });
const w = createWorld("probe", map, 0);
for (const kind of ["stick", "cow", "hens", "inn", "hat", "curseReply", "signpost", "levelUp"] as const) {
  const u = speakKind(w, map, kind, [], 4, 0.2);
  console.log(kind.padEnd(11), u ? u.text : "NULL");
}
