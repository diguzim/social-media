import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cx, resolveResponsiveClasses } from "./utils.js";
import type { GridColumns, ResponsiveValue } from "./types.js";

const gridColumnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const gridColumnValues = Object.keys(gridColumnClasses).map(
  Number,
) as GridColumns[];

function isGridColumns(value: number): value is GridColumns {
  return gridColumnValues.includes(value as GridColumns);
}

function resolveColumnsClass(
  columns: ResponsiveValue<GridColumns> | GridColumnsConfig,
): string {
  if (typeof columns === "number") {
    return gridColumnClasses[columns] ?? gridColumnClasses[1];
  }

  const base = columns.base ?? columns.default ?? 1;
  const parts = [gridColumnClasses[base] ?? gridColumnClasses[1]];

  for (const breakpoint of ["sm", "md", "lg", "xl"] as const) {
    const value = columns[breakpoint];

    if (value !== undefined && isGridColumns(value)) {
      parts.push(`${breakpoint}:${gridColumnClasses[value]}`);
    }
  }

  return parts.join(" ");
}

export interface GridColumnsConfig {
  base?: GridColumns;
  default?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns: ResponsiveValue<GridColumns> | GridColumnsConfig;
  gap?: ResponsiveValue<string>;
  dataTestId?: string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { children, columns, gap = "gap-4", className, dataTestId, ...props },
  ref,
) {
  const columnsClass = resolveColumnsClass(columns);
  const gapClass = resolveResponsiveClasses(
    gap,
    (value: string) => value,
    "gap-4",
  );

  return (
    <div
      ref={ref}
      {...props}
      data-testid={dataTestId}
      className={cx("grid mx-auto w-full", columnsClass, gapClass, className)}
    >
      {children}
    </div>
  );
});

Grid.displayName = "Grid";
