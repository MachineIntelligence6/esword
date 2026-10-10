import { describe, expect, it } from "vitest";
import { describeActivity, describeImport } from "@/server/activity-log";

describe("describeActivity", () => {
  it("keeps the single-record wording", () => {
    expect(describeActivity("Ann", "CREATE", "Verse")).toBe("Ann created new verse");
    expect(describeActivity("Ann", "UPDATE", "Chapter")).toBe("Ann updated chapter");
    expect(describeActivity("Ann", "ARCHIVE", "Book")).toBe("Ann archived book");
  });

  it("states how many rows a bulk write touched", () => {
    expect(describeActivity("Ann", "ARCHIVE", "Chapter", 12)).toBe("Ann archived 12 chapters");
    expect(describeActivity("Ann", "DELETE", "Verse", 1)).toBe("Ann deleted 1 verse");
    expect(describeActivity("Ann", "RESTORE", "Commentary", 1500)).toBe("Ann restored 1,500 commentaries");
  });

  it("describes about page edits", () => {
    expect(describeActivity("Ann", "UPDATE", "AboutContent")).toBe("Ann updated about page content");
  });
});

describe("describeImport", () => {
  it("summarises a single-book import", () => {
    expect(describeImport("Ann", ["II Psalms"], 2990, 4)).toBe(
      "Ann imported 2,994 verses into II Psalms (2,990 new, 4 changed)"
    );
  });

  it("summarises a multi-book import with only new verses", () => {
    expect(describeImport("Ann", ["Enoch", "Noah"], 1, 0)).toBe("Ann imported 1 verse into 2 books (1 new)");
  });
});
