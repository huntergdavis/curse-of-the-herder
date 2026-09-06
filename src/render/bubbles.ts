export interface Bubble {
  text: string;
  heat: number;
  untilMs: number;
  /** "herder" or a sheep id for a wordless emote. */
  anchor: "herder" | number;
}

export class Bubbles {
  list: Bubble[] = [];
  say(text: string, heat: number, seconds: number, nowMs: number): void {
    // One herder bubble at a time; a new line replaces the old one.
    this.list = this.list.filter((b) => b.anchor !== "herder");
    this.list.push({ text, heat, untilMs: nowMs + seconds * 1000, anchor: "herder" });
  }
  emote(sheepId: number, glyph: string, seconds: number, nowMs: number): void {
    this.list = this.list.filter((b) => b.anchor !== sheepId);
    this.list.push({ text: glyph, heat: 0, untilMs: nowMs + seconds * 1000, anchor: sheepId });
  }
  prune(nowMs: number): void {
    this.list = this.list.filter((b) => b.untilMs > nowMs);
  }
  herderLine(): Bubble | undefined {
    return this.list.find((b) => b.anchor === "herder");
  }
}
