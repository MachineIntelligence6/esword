import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StaticContentPageProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * Clean site page beside the books/chapters sidebar:
 * silver title bar + white content (not a login-style blue stage).
 */
export function StaticContentPage({
  title,
  children,
  className,
}: StaticContentPageProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-white">
      <h3 className="w-full shrink-0 border-b border-silver-light bg-silver-light px-5 py-3 text-xs font-bold uppercase text-primary-dark lg:pl-3">
        {title}
      </h3>
      <div className={cn("w-full flex-1 px-5 py-6 md:px-8 md:py-8", className)}>
        {children}
      </div>
    </div>
  );
}
