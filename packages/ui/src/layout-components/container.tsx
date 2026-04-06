import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cx, resolveResponsiveClasses } from "./utils.js";
import type { ContainerMaxWidth, ResponsiveValue } from "./types.js";

const containerMaxWidthClasses: Record<ContainerMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: ResponsiveValue<ContainerMaxWidth>;
  padding?: ResponsiveValue<string>;
  dataTestId?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(
    {
      children,
      className,
      maxWidth = "6xl",
      padding = "px-4 py-10",
      dataTestId,
      ...props
    },
    ref,
  ) {
    const maxWidthClass = resolveResponsiveClasses(
      maxWidth,
      (value: ContainerMaxWidth) => containerMaxWidthClasses[value],
      "6xl",
    );
    const paddingClass = resolveResponsiveClasses(
      padding,
      (value: string) => value,
      "px-4 py-10",
    );

    return (
      <div
        ref={ref}
        {...props}
        data-testid={dataTestId}
        className={cx("mx-auto w-full", maxWidthClass, paddingClass, className)}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";
