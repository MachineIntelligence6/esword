import { describe, expect, it } from "vitest";
import { sanitizeIncludeForContext } from "@/server/sanitize-include";

const viewer = { isAdmin: false, userId: 42 };
const admin = { isAdmin: true, userId: 1 };

describe("sanitizeIncludeForContext", () => {
  it("scopes a nested notes relation to the caller for a viewer", () => {
    const out: any = sanitizeIncludeForContext({ notes: true }, viewer);
    expect(out.notes.where.userId).toBe(42);
  });

  it("overrides a client-supplied userId on a private relation", () => {
    const out: any = sanitizeIncludeForContext(
      { notes: { where: { userId: 999, archived: false } } },
      viewer
    );
    expect(out.notes.where.userId).toBe(42);
    expect(out.notes.where.archived).toBe(false);
  });

  it("scopes private relations at any depth", () => {
    const out: any = sanitizeIncludeForContext(
      { verse: { include: { highlights: true, notes: { where: { userId: 7 } } } } },
      viewer
    );
    expect(out.verse.include.highlights.where.userId).toBe(42);
    expect(out.verse.include.notes.where.userId).toBe(42);
  });

  it("reduces a user relation to non-PII fields for a viewer", () => {
    const out: any = sanitizeIncludeForContext({ user: true }, viewer);
    expect(out.user).toEqual({ select: { id: true, name: true, role: true, image: true } });
    expect(JSON.stringify(out)).not.toContain("email");
    expect(JSON.stringify(out)).not.toContain("password");
  });

  it("drops an attacker's user.select of email/password", () => {
    const out: any = sanitizeIncludeForContext(
      { notes: { include: { user: { select: { email: true, password: true } } } } },
      viewer
    );
    expect(out.notes.include.user.select).toEqual({ id: true, name: true, role: true, image: true });
  });

  it("leaves the include untouched for an admin", () => {
    const input = { notes: { include: { user: true } } };
    expect(sanitizeIncludeForContext(input, admin)).toBe(input);
  });

  it("does not rewrite _count aggregates", () => {
    const out: any = sanitizeIncludeForContext({ _count: { select: { notes: true } } }, viewer);
    expect(out._count.select.notes).toBe(true);
  });

  it("preserves public content relations", () => {
    const out: any = sanitizeIncludeForContext(
      { topic: { include: { chapter: { include: { book: true } } } } },
      viewer
    );
    expect(out.topic.include.chapter.include.book).toBe(true);
  });
});
