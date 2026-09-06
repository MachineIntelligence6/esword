import { describe, expect, it } from "vitest";
import {
  ExportableBook,
  formatBookAsCsv,
  formatBookAsRemediesText,
} from "@/lib/book-export";

const sampleBook: ExportableBook = {
  name: "Book of Remedies",
  slug: "book-of-remedies",
  abbreviation: "BOR",
  chapters: [
    {
      name: 1,
      commentaryName: "The Beginning of Natural Remedies",
      topics: [
        {
          number: 1,
          name: "The Beginning of Natural Remedies",
          verses: [
            {
              number: 1,
              text: "The Book of the Remedies which the wise men of old did seal...",
            },
            {
              number: 2,
              text: "For in those days, the wicked spirits began to afflict...",
            },
          ],
        },
      ],
    },
    {
      name: 2,
      commentaryName: "On the Wisdom of Physicians",
      topics: [
        {
          number: 1,
          name: "The Seven Gates of the Face",
          verses: [
            {
              number: 1,
              text: "And there were created in the face of man seven gates.",
            },
          ],
        },
        {
          number: 2,
          name: "The Twelve Governors",
          verses: [
            {
              number: 2,
              text: "The first is the liver, the second the gall, and the third the spleen.",
            },
          ],
        },
      ],
    },
    {
      name: 3,
      commentaryName: null,
      topics: [
        {
          number: 1,
          name: "Chapter 3",
          verses: [
            {
              number: 1,
              text: "Concerning the foundations of the sons of men...\nCHAPTER BREAK - ignore me",
            },
          ],
        },
      ],
    },
  ],
};

describe("book export formats", () => {
  it("formats the remedies text with chapter/title/section/verse markers", () => {
    const text = formatBookAsRemediesText(sampleBook);

    expect(text).toContain("CHAPTER: 1\nTITLE: The Beginning of Natural Remedies");
    expect(text).not.toContain("SECTION: The Beginning of Natural Remedies");
    expect(text).toContain("VERSE: 1\nThe Book of the Remedies which the wise men of old did seal...");
    expect(text).toContain("SECTION: The Seven Gates of the Face");
    expect(text).toContain("SECTION: The Twelve Governors");
    expect(text).toContain("CHAPTER: 3\nTITLE: [REVIEW REQUIRED]");
    expect(text).not.toContain("SECTION: Chapter 3");
    expect(text).not.toContain("CHAPTER BREAK");
  });

  it("formats import-compatible CSV rows", () => {
    const csv = formatBookAsCsv(sampleBook);
    const lines = csv.trim().split("\n");

    expect(lines[0]).toBe("Book$Abbreviation$Chapter$Topic$Verse$Text");
    expect(lines[1]).toBe(
      "Book of Remedies$BOR$1$The Beginning of Natural Remedies$1$The Book of the Remedies which the wise men of old did seal..."
    );
    expect(lines.some((line) => line.includes("The Seven Gates of the Face"))).toBe(
      true
    );
  });
});
