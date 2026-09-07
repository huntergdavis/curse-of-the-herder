// Print village coordinates for a seed: npx tsx scripts/village-of.ts <seed>
import { generateMap } from "../src/core/map/generate";
const map = generateMap(process.argv[2] ?? "seed", { size: 576 });
for (const v of map.villages) console.log(`${v.name}: cam=${v.x},${v.y}`);
