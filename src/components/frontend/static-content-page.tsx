import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StaticContentPageProps = {
  title: string;
  children: ReactNode;
  /** Constrain the white card width (donate-style) or let it fill (about-style). */
  cardClassName?: string;
  contentClassName?: string;
};

/**
 * Clean content page that sits beside the books/chapters sidebar.
 * Title bar + blue stage + white card — same chrome as Donate.
 */
export function StaticContentPage({
  title,
  children,
  cardClassName,
  contentClassName,
}: StaticContentPageProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-primary">
      <h3 className="w-full border-b bg-silver-light px-5 py-3 text-xs font-bold uppercase text-primary-dark lg:border-0 lg:pl-3">
        {title}
      </h3>
      <div
        className={cn(
          "flex w-full flex-1 items-start justify-center border-t-2 border-silver-light px-4 py-8 md:items-center md:px-6",
          contentClassName
        )}
      >
        <div
          className={cn(
            "w-full rounded-lg bg-white shadow-sm",
            cardClassName ?? "max-w-3xl"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
