import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cx, resolveResponsiveClasses } from "./utils.js";
import type {
  ResponsiveValue,
  StackAlign,
  StackDirection,
  StackJustify,
} from "./types.js";

const directionClasses: Record<StackDirection, string> = {
  vertical: "flex-col",
  horizontal: "flex-row",
};

const alignClasses: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: ResponsiveValue<StackDirection>;
  gap?: ResponsiveValue<string>;
  align?: ResponsiveValue<StackAlign>;
  justify?: ResponsiveValue<StackJustify>;
  dataTestId?: string;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    children,
    direction = "vertical",
    gap = "gap-4",
    align = "stretch",
    justify = "start",
    className,
    dataTestId,
    ...props
  },
  ref,
) {
  const directionClass = resolveResponsiveClasses(
    direction,
    (value: StackDirection) => directionClasses[value],
    "vertical",
  );
  const alignClass = resolveResponsiveClasses(
    align,
    (value: StackAlign) => alignClasses[value],
    "stretch",
  );
  const justifyClass = resolveResponsiveClasses(
    justify,
    (value: StackJustify) => justifyClasses[value],
    "start",
  );
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
      className={cx(
        "flex mx-auto w-full",
        directionClass,
        gapClass,
        alignClass,
        justifyClass,
        className,
      )}
    >
      {children}
    </div>
  );
});

Stack.displayName = "Stack";
