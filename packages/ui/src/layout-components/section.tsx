import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cx, resolveResponsiveClasses } from "./utils.js";
import type { ResponsiveValue } from "./types.js";

const backgroundClasses = {
  primary: "bg-white",
  secondary: "bg-slate-50",
  accent: "bg-blue-50",
  danger: "bg-red-50",
  transparent: "bg-transparent",
} as const;

export type SectionBackground = keyof typeof backgroundClasses;

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  background?: SectionBackground;
  hasBorder?: boolean | string;
  padding?: ResponsiveValue<string>;
  dataTestId?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    children,
    title,
    subtitle,
    background = "primary",
    hasBorder = false,
    padding = "p-6",
    className,
    dataTestId,
    ...props
  },
  ref,
) {
  const headingId = useId();
  const backgroundClass = backgroundClasses[background];
  const borderClass =
    typeof hasBorder === "string"
      ? hasBorder
      : hasBorder
        ? "border border-slate-200"
        : "";
  const paddingClass = resolveResponsiveClasses(
    padding,
    (value: string) => value,
    "p-6",
  );
  const sectionTitleId = title ? `${headingId}-title` : undefined;

  return (
    <section
      ref={ref}
      {...props}
      data-testid={dataTestId}
      aria-labelledby={sectionTitleId}
      className={cx(
        backgroundClass,
        borderClass,
        "rounded-lg",
        paddingClass,
        className,
      )}
    >
      {title ? (
        <header className="mb-4">
          <h2 id={sectionTitleId} className="text-2xl font-bold text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
});

Section.displayName = "Section";
