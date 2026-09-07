import { describe, expect, it } from "vitest";
import { article, countSyllables, numberWord, ordinalWord, pluralize, tidySentence, verbForm } from "./morphology";

describe("morphology", () => {
  it("chooses a/an by sound", () => {
    expect(article("hour")).toBe("an");
    expect(article("ewe")).toBe("a");
    expect(article("unicorn")).toBe("a");
    expect(article("apple")).toBe("an");
    expect(article("hill")).toBe("a");
  });
  it("pluralises", () => {
    expect(pluralize("sheep")).toBe("sheep");
    expect(pluralize("hoof")).toBe("hooves");
    expect(pluralize("lump of regret")).toBe("lumps of regret");
    expect(pluralize("daisy")).toBe("daisies");
    expect(pluralize("bush")).toBe("bushes");
    expect(pluralize("wet blanket")).toBe("wet blankets");
    expect(pluralize("typhoons")).toBe("typhoons");
    expect(pluralize("mushroom with legs")).toBe("mushrooms with legs");
    expect(pluralize("truffle nobody wanted")).toBe("truffles nobody wanted");
    expect(pluralize("party of the first part")).toBe("parties of the first part");
    expect(pluralize("boss")).toBe("bosses");
    expect(pluralize("bus")).toBe("buses");
  });
  it("conjugates", () => {
    expect(verbForm("carry", "s")).toBe("carries");
    expect(verbForm("flee", "ed")).toBe("fled");
    expect(verbForm("trudge", "ing")).toBe("trudging");
    expect(verbForm("sit", "ing")).toBe("sitting");
    expect(verbForm("wander", "ed")).toBe("wandered");
  });
  it("counts syllables roughly", () => {
    expect(countSyllables("sheep")).toBe(1);
    expect(countSyllables("turnip")).toBe(2);
    expect(countSyllables("wheelbarrow")).toBe(3);
    expect(countSyllables("miserable")).toBe(4);
    expect(countSyllables("bramble")).toBe(2);
  });
  it("spells numbers", () => {
    expect(numberWord(7)).toBe("seven");
    expect(numberWord(42)).toBe("forty-two");
    expect(ordinalWord(3)).toBe("third");
    expect(ordinalWord(20)).toBe("twentieth");
    expect(ordinalWord(45)).toBe("forty-fifth");
    expect(ordinalWord(31)).toBe("thirty-first");
  });
  it("tidies sentences", () => {
    expect(tidySentence("this   is a hill , sheep")).toBe("This is a hill, sheep.")
    expect(tidySentence("a ewe. a owl")).toBe("A ewe. An owl.");
    expect(tidySentence("i hate it!")).toBe("I hate it!");
    expect(tidySentence("a swab. (it scans.)")).toBe("A swab. (It scans.)");
    expect(tidySentence("Nell. ...Fine.")).toBe("Nell. …Fine.");
  });
});
