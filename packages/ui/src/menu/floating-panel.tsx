import { cx } from "../layout-components/utils.js";
import type { HTMLAttributes, ReactNode } from "react";

export type FloatingPanelSide = "top" | "bottom";
export type FloatingPanelAlign = "start" | "center" | "end";
export type FloatingPanelOffset = "none" | "sm" | "md";

const sideClasses: Record<FloatingPanelSide, string> = {
  top: "bottom-full",
  bottom: "top-full",
};

const alignClasses: Record<FloatingPanelAlign, string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

const offsetClasses: Record<
  FloatingPanelSide,
  Record<FloatingPanelOffset, string>
> = {
  top: {
    none: "",
    sm: "mb-1",
    md: "mb-2",
  },
  bottom: {
    none: "",
    sm: "mt-1",
    md: "mt-2",
  },
};

export interface FloatingPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  dataTestId?: string;
  side?: FloatingPanelSide;
  align?: FloatingPanelAlign;
  offset?: FloatingPanelOffset;
}

export function FloatingPanel({
  children,
  className,
  dataTestId,
  side = "bottom",
  align = "end",
  offset = "md",
  ...props
}: FloatingPanelProps) {
  return (
    <div
      {...props}
      data-testid={dataTestId}
      className={cx(
        "absolute z-50 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg",
        sideClasses[side],
        alignClasses[align],
        offsetClasses[side][offset],
        className,
      )}
    >
      {children}
    </div>
  );
}
