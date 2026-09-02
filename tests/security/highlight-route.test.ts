import { beforeEach, describe, expect, it, vi } from "vitest";

const handlersMock = vi.hoisted(() => ({
  highlights: {
    getById: vi.fn().mockResolvedValue({ succeed: true, data: { id: 7 } }),
    archive: vi.fn().mockResolvedValue({ succeed: true, data: null }),
  },
  bookmarks: {
    getById: vi.fn(),
    archive: vi.fn(),
  },
}));

vi.mock("@/server/handlers", () => ({
  default: handlersMock,
}));

describe("highlight id route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the highlights handler for reads", async () => {
    const { GET } = await import("@/app/api/highlights/[id]/route");

    await GET(new Request("http://test.local/api/highlights/7"), {
      params: { id: "7" },
    });

    expect(handlersMock.highlights.getById).toHaveBeenCalledWith(7);
    expect(handlersMock.bookmarks.getById).not.toHaveBeenCalled();
  });

  it("uses the highlights handler for deletion", async () => {
    const { DELETE } = await import("@/app/api/highlights/[id]/route");

    await DELETE(new Request("http://test.local/api/highlights/7"), {
      params: { id: "7" },
    });

    expect(handlersMock.highlights.archive).toHaveBeenCalledWith(7);
    expect(handlersMock.bookmarks.archive).not.toHaveBeenCalled();
  });
});
