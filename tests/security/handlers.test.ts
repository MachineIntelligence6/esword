import { beforeEach, describe, expect, it, vi } from "vitest";
import * as activities from "@/server/handlers/activities.api";
import * as blogs from "@/server/handlers/blogs.api";
import * as bookmarks from "@/server/handlers/bookmarks.api";
import * as books from "@/server/handlers/books.api";
import * as highlights from "@/server/handlers/highlights.api";
import * as notes from "@/server/handlers/notes.api";
import * as settings from "@/server/handlers/settings.api";
import * as users from "@/server/handlers/users.api";

const authzMock = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireAdmin: vi.fn(),
  requireContentManager: vi.fn(),
  isAuthError: (result: any) => "succeed" in result && result.succeed === false,
}));

const dbMock = vi.hoisted(() => ({
  activity: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  blog: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  bookmark: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  book: {
    findFirst: vi.fn(),
  },
  highlight: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  note: {
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({ default: dbMock }));
vi.mock("@/server/handlers/authz", () => authzMock);

const unauthorized = { succeed: false, code: "UNAUTHORIZED", data: null };
const readerSession = {
  user: { id: "1", name: "Reader", email: "reader@example.com", role: "VIEWER" },
};
const adminSession = {
  user: { id: "2", name: "Admin", email: "admin@example.com", role: "ADMIN" },
};

describe("security handler boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authzMock.requireAuth.mockResolvedValue(readerSession);
    authzMock.requireAdmin.mockResolvedValue(unauthorized);
    authzMock.requireContentManager.mockResolvedValue(unauthorized);
    dbMock.note.findMany.mockResolvedValue([]);
    dbMock.note.count.mockResolvedValue(0);
    dbMock.note.update.mockResolvedValue({ id: 10, userId: 1, text: "updated" });
    dbMock.bookmark.findMany.mockResolvedValue([]);
    dbMock.bookmark.count.mockResolvedValue(0);
    dbMock.highlight.findMany.mockResolvedValue([]);
    dbMock.highlight.count.mockResolvedValue(0);
    dbMock.blog.findMany.mockResolvedValue([]);
    dbMock.blog.count.mockResolvedValue(0);
    dbMock.activity.findMany.mockResolvedValue([]);
    dbMock.activity.count.mockResolvedValue(0);
  });

  it("blocks unauthenticated access to private notes", async () => {
    authzMock.requireAuth.mockResolvedValueOnce(unauthorized);

    const response = await notes.getAll({});

    expect(response).toEqual(unauthorized);
    expect(dbMock.note.findMany).not.toHaveBeenCalled();
  });

  it("prevents cross-user notes access through supplied where/user filters", async () => {
    await notes.getAll({ user: 999, where: { userId: 999 } as any });

    expect(dbMock.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 1 }),
      })
    );
  });

  it("prevents cross-user note updates by scoping updates to the session user", async () => {
    const req = new Request("http://test.local/api/notes/10", {
      method: "PUT",
      body: JSON.stringify({ text: "updated" }),
    });

    await notes.update(req, 10);

    expect(dbMock.note.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 10, userId: 1 }),
      })
    );
  });

  it("prevents bookmark IDOR through caller-supplied filters", async () => {
    await bookmarks.getAll({ where: { userId: 999 } as any });

    expect(dbMock.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 1 }),
      })
    );
  });

  it("prevents highlight IDOR through caller-supplied filters", async () => {
    await highlights.getAll({ where: { userId: 999 } as any });

    expect(dbMock.highlight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 1 }),
      })
    );
  });

  it("allows admin-scoped ownership queries for support workflows", async () => {
    authzMock.requireAuth.mockResolvedValueOnce(adminSession);

    await notes.getAll({ user: 999, where: { archived: false } as any });

    expect(dbMock.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 999 }),
      })
    );
  });

  it("makes destructive content actions admin-only", async () => {
    const response = await books.archive(1);

    expect(response).toEqual(unauthorized);
    expect(dbMock.book.findFirst).not.toHaveBeenCalled();
  });

  it("makes admin/editor content writes backend-enforced", async () => {
    const req = new Request("http://test.local/api/settings/aboutcontent", {
      method: "POST",
      body: JSON.stringify({ title: "Title", content: "Content" }),
    });

    const response = await settings.saveAboutContent(req);

    expect(response).toEqual(unauthorized);
  });

  it("makes users and activities admin-only", async () => {
    await users.getAll({});
    await activities.getAll({});

    expect(authzMock.requireAdmin).toHaveBeenCalledTimes(2);
  });

  it("does not expose password hashes through blog user includes", async () => {
    await blogs.getAll({});

    expect(dbMock.blog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: {
            select: expect.not.objectContaining({ password: true }),
          },
          book: true,
          chapter: true,
          verse: true,
        }),
      })
    );
  });
});
