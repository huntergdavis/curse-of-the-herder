import { keyedUnit } from "./rng";

const FIRST = [
  "Fennick", "Wulfric", "Mags", "Dunstan", "Hob", "Alwin", "Tamsin", "Godric", "Bran", "Osric",
  "Edda", "Perkin", "Wat", "Cuthbert", "Aldous", "Nell", "Piers", "Hodge", "Gilly", "Ansel",
  "Bartle", "Elric", "Maud", "Rowan", "Silas", "Tobin", "Ulric", "Wynn", "Ysolde", "Jory",
  "Ebenezer", "Hamnet", "Lettice", "Oswin", "Rafe", "Sibyl", "Thurstan", "Cadoc", "Idony", "Mungo",
];
const EPITHET = [
  "the Damp", "of the Lower Field", "the Unlucky", "Twice-Bitten", "the Hoarse", "of Wether Cross",
  "the Long-Suffering", "Mudfoot", "the Weary", "of No Fixed Temper", "the Sodden", "Half-Awake",
  "the Perpetual", "of the Steep Bit", "the Muttering", "Crookhand", "the Woolly-Minded", "Sheepless",
  "the Bewildered", "of the Far Pen", "the Grumbling", "Gatekeeper", "the Rained-On", "the Late",
];

export function herderName(seed: string): string {
  const f = FIRST[Math.floor(keyedUnit(seed, "herder-first") * FIRST.length)] ?? "Fennick";
  const e = EPITHET[Math.floor(keyedUnit(seed, "herder-epithet") * EPITHET.length)] ?? "the Damp";
  return `${keyedUnit(seed, "herder-old") < 0.4 ? "Old " : ""}${f} ${e}`;
}

const SHEEP = [
  "Gerald", "Beatrix", "Lord Fluffington", "The Other Gerald", "Marjorie", "Doreen", "Clive", "Nigel",
  "Pamela", "Barnaby", "Eunice", "Reginald", "Wendy", "Horace", "Prudence", "Montague", "Agnes",
  "Percival", "Gwendolyn", "Cedric", "Hilda", "Rupert", "Mildred", "Ambrose", "Edith", "Cuthbert",
  "Winifred", "Bartholomew", "Muriel", "Humphrey", "Ethel", "Lancelot", "Dorothy", "Fitzwilliam",
  "Gladys", "Wilberforce", "Bernadette", "Algernon", "Philippa", "Cornelius", "Maureen", "Basil",
];

export function sheepName(seed: string, sheepId: number): string {
  return SHEEP[Math.floor(keyedUnit(seed, "sheep-name", sheepId) * SHEEP.length)] ?? "Gerald";
}
