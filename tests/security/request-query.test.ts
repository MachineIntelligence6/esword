import { describe, expect, it } from "vitest";
import {
  getSearchParams,
  parseIdListParam,
  parseIntegerParam,
  parseJsonParam,
} from "@/server/request-query";

describe("request query parsing", () => {
  it("parses search params from a request URL", () => {
    const req = new Request("http://test.local/api/books?page=2");

    expect(getSearchParams(req).get("page")).toBe("2");
  });

  it("falls back for invalid or out-of-range integers", () => {
    const params = new URLSearchParams("page=abc&perPage=0");

    expect(parseIntegerParam(params, "page", 1, { min: 1 })).toBe(1);
    expect(parseIntegerParam(params, "perPage", 20, { min: 1 })).toBe(20);
  });

  it("ignores malformed JSON query params", () => {
    const params = new URLSearchParams("where=%7Bbad-json");

    expect(parseJsonParam(params, "where")).toBeUndefined();
  });

  it("ignores oversized JSON query params", () => {
    const oversized = "a".repeat(10_001);
    const params = new URLSearchParams({ where: oversized });

    expect(parseJsonParam(params, "where")).toBeUndefined();
  });

  it("accepts object JSON query params", () => {
    const params = new URLSearchParams({
      orderBy: JSON.stringify({ id: "asc" }),
    });

    expect(parseJsonParam(params, "orderBy")).toEqual({ id: "asc" });
  });

  it("filters ID list params to positive safe integers", () => {
    const params = new URLSearchParams("ids=1,two,-3,4.7,5,9007199254740993");

    expect(parseIdListParam(params, "ids")).toEqual([1, 5]);
  });
});
