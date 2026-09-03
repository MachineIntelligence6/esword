import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CellVariant = "primary" | "secondary" | "wide" | "compact";

const variantClass: Record<CellVariant, string> = {
  primary: "min-w-[8rem] max-w-[28rem]",
  secondary: "min-w-[6rem] max-w-[14rem]",
  wide: "min-w-[12rem] max-w-[40rem]",
  compact: "min-w-[3rem] max-w-[6rem]",
};

type TableCellTextProps = {
  children?: ReactNode;
  title?: string;
  variant?: CellVariant;
  className?: string;
  clamp?: 1 | 2 | 3;
};

export function TableCellText({
  children,
  title,
  variant = "primary",
  className,
  clamp,
}: TableCellTextProps) {
  const text = typeof children === "string" || typeof children === "number"
    ? String(children)
    : title;

  const clampClass =
    clamp === 1
      ? "line-clamp-1"
      : clamp === 2
        ? "line-clamp-2"
        : clamp === 3
          ? "line-clamp-3"
          : "truncate";

  return (
    <span
      title={text || undefined}
      className={cn(
        "block font-medium",
        variantClass[variant],
        clampClass,
        className
      )}
    >
      {children}
    </span>
  );
}

type TableCellLinkProps = {
  href: string;
  children?: ReactNode;
  title?: string;
  variant?: CellVariant;
  className?: string;
  disabled?: boolean;
  clamp?: 1 | 2 | 3;
};

export function TableCellLink({
  href,
  children,
  title,
  variant = "secondary",
  className,
  disabled,
  clamp,
}: TableCellLinkProps) {
  const text = typeof children === "string" || typeof children === "number"
    ? String(children)
    : title;

  const clampClass =
    clamp === 1
      ? "line-clamp-1"
      : clamp === 2
        ? "line-clamp-2"
        : clamp === 3
          ? "line-clamp-3"
          : "truncate";

  if (disabled) {
    return (
      <TableCellText variant={variant} title={text} clamp={clamp} className={cn("text-gray-700", className)}>
        {children}
      </TableCellText>
    );
  }

  return (
    <Link
      href={href}
      title={text || undefined}
      className={cn(
        "block text-primary font-medium hover:underline",
        variantClass[variant],
        clampClass,
        className
      )}
    >
      {children}
    </Link>
  );
}
