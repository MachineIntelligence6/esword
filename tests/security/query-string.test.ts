import { describe, expect, it } from "vitest";
import { buildApiQuery } from "@/client/query-string";

describe("buildApiQuery", () => {
  it("omits undefined and null params", () => {
    expect(
      buildApiQuery({
        page: 1,
        include: undefined,
        where: null,
        orderBy: { updatedAt: "desc" },
      })
    ).toBe("?page=1&orderBy=%7B%22updatedAt%22%3A%22desc%22%7D");
  });

  it("returns empty string when nothing is set", () => {
    expect(buildApiQuery({ include: undefined, where: null })).toBe("");
  });
});
