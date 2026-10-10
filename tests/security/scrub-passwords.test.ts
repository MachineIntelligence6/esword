import { describe, expect, it } from "vitest";
import { scrubPasswords } from "@/server/scrub-passwords";

const HASH = "$2a$10$abcdefghijklmnopqrstuv";

describe("scrubPasswords", () => {
  it("removes password from a relation reached through a content record", () => {
    // Shape of a `verse` with a client-supplied include=notes.user traversal.
    const verse = {
      id: 1,
      text: "In the beginning",
      notes: [
        { id: 9, text: "private note", userId: 3, user: { id: 3, email: "a@b.c", password: HASH } },
      ],
    };
    scrubPasswords(verse, false);
    expect((verse.notes[0].user as Record<string, unknown>).password).toBeUndefined();
    expect(verse.notes[0].user.email).toBe("a@b.c");
  });

  it("keeps password only on the root rows of a direct User query", () => {
    const user: any = {
      id: 3,
      password: HASH,
      notes: [{ id: 1, user: { id: 7, password: HASH } }],
    };
    scrubPasswords(user, true);
    // Root user keeps its hash (credential checks rely on it)...
    expect(user.password).toBe(HASH);
    // ...but a user reached through a relation does not.
    expect(user.notes[0].user.password).toBeUndefined();
  });

  it("scrubs every row of an array result and deep nesting", () => {
    const books: any = [
      {
        id: 1,
        chapters: [
          { topics: [{ verses: [{ notes: [{ user: { password: HASH } }] }] }] },
        ],
      },
    ];
    scrubPasswords(books, false);
    expect(books[0].chapters[0].topics[0].verses[0].notes[0].user.password).toBeUndefined();
  });

  it("is a no-op for primitives and null", () => {
    expect(() => scrubPasswords(null, false)).not.toThrow();
    expect(() => scrubPasswords(42, false)).not.toThrow();
    expect(() => scrubPasswords("x", false)).not.toThrow();
  });
});
