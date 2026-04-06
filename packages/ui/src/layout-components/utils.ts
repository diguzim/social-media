import type { Breakpoint, ResponsiveValue } from "./types.js";

export function cx(
  ...classes: Array<string | null | undefined | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const breakpointOrder: ReadonlyArray<Exclude<Breakpoint, "base">> = [
  "sm",
  "md",
  "lg",
  "xl",
];

export function resolveResponsiveClasses<T>(
  value: ResponsiveValue<T> | undefined,
  toClassName: (input: T) => string,
  fallback: T,
): string {
  if (value === undefined) {
    return toClassName(fallback);
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return toClassName(value as T);
  }

  const responsiveValue = value as Partial<Record<Breakpoint | "default", T>>;

  const classes: string[] = [];
  const baseValue = responsiveValue.base ?? responsiveValue.default ?? fallback;
  classes.push(toClassName(baseValue));

  for (const breakpoint of breakpointOrder) {
    const breakpointValue = responsiveValue[breakpoint];

    if (breakpointValue !== undefined) {
      classes.push(`${breakpoint}:${toClassName(breakpointValue)}`);
    }
  }

  return classes.join(" ");
}
