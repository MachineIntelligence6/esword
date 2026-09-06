import { cn } from "@/lib/utils";

type VerseReferenceProps = {
  abbreviation?: string | null;
  chapter?: string | number | null;
  verse?: string | number | null;
  className?: string;
};

/**
 * Bible-style ref: first letter of the abbreviation full size,
 * remaining abbreviation letters + chapter:verse slightly smaller.
 */
export function VerseReference({
  abbreviation,
  chapter,
  verse,
  className,
}: VerseReferenceProps) {
  const abbr = (abbreviation ?? "").trim();
  const first = abbr.slice(0, 1);
  const rest = abbr.slice(1);
  const citation =
    chapter != null && verse != null
      ? `${chapter}:${verse}`
      : chapter != null
        ? String(chapter)
        : "";

  if (!first && !citation) return null;

  return (
    <span className={cn("whitespace-nowrap", className)}>
      {first}
      {rest ? <span className="text-[0.82em]">{rest}</span> : null}
      {citation ? (
        <span className="text-[0.82em]">
          {first || rest ? " " : ""}
          {citation}
        </span>
      ) : null}
    </span>
  );
}
