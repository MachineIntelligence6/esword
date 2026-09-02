import { describe, expect, it } from "vitest";
import {
  escapeRegExp,
  sanitizeRichHtml,
  sanitizeVerseHtml,
} from "@/lib/sanitize-html";

describe("HTML sanitization", () => {
  it("strips script tags from verse HTML while keeping mark highlights", () => {
    const dirty =
      '<mark id="1">faith</mark><script>alert(1)</script><img src=x onerror=alert(1)>';

    expect(sanitizeVerseHtml(dirty)).toBe('<mark id="1">faith</mark>');
  });

  it("strips event handlers and scripts from rich HTML", () => {
    const dirty =
      '<p onclick="alert(1)">Hello <strong>world</strong></p><script>alert(2)</script><a href="javascript:alert(3)">link</a>';

    const clean = sanitizeRichHtml(dirty);

    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain("<strong>world</strong>");
  });

  it("escapes regex metacharacters used by highlight matching", () => {
    expect(escapeRegExp("a+b(c)")).toBe("a\\+b\\(c\\)");
  });
});
