import DOMPurify from "isomorphic-dompurify";

const RICH_TEXT_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
] as const;

const RICH_TEXT_ATTR = [
  "alt",
  "class",
  "height",
  "href",
  "id",
  "src",
  "style",
  "target",
  "title",
  "width",
  "rel",
] as const;

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sanitizeVerseHtml(html: string | null | undefined) {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS: ["mark", "span", "br"],
    ALLOWED_ATTR: ["id", "class"],
  });
}

export function sanitizeRichHtml(html: string | null | undefined) {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS: [...RICH_TEXT_TAGS],
    ALLOWED_ATTR: [...RICH_TEXT_ATTR],
    ALLOW_DATA_ATTR: false,
  });
}
