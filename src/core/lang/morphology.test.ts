import { describe, expect, it } from "vitest";
import { article, numberWord, ordinalWord, pluralize, tidySentence, verbForm } from "./morphology";

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
  });
  it("conjugates", () => {
    expect(verbForm("carry", "s")).toBe("carries");
    expect(verbForm("flee", "ed")).toBe("fled");
    expect(verbForm("trudge", "ing")).toBe("trudging");
    expect(verbForm("sit", "ing")).toBe("sitting");
    expect(verbForm("wander", "ed")).toBe("wandered");
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
  });
});
