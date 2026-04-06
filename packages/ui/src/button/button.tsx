import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  ReactNode,
} from "react";
import { forwardRef } from "react";

import { cx } from "../layout-components/utils.js";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link"
  | "toggle";

export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<Exclude<ButtonVariant, "toggle">, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  destructive:
    "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500",
  ghost:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
  link: "bg-transparent px-0 py-0 text-primary-600 hover:underline hover:text-primary-700 focus-visible:ring-primary-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-md px-2 py-1 text-xs",
  md: "rounded-md px-4 py-2 text-sm",
  lg: "rounded-lg px-5 py-2.5 text-base",
};

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isPending?: boolean;
  pendingText?: string;
  dataTestId?: string;
  className?: string;
};

type ButtonElementProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
    pressed?: boolean;
  };

type AnchorElementProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a";
    pressed?: boolean;
  };

export type ButtonProps = ButtonElementProps | AnchorElementProps;

function resolveVariantClass(variant: ButtonVariant, pressed: boolean): string {
  if (variant !== "toggle") {
    return variantClasses[variant];
  }

  return pressed
    ? "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500"
    : "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400";
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    isPending = false,
    pendingText,
    dataTestId,
    className,
    pressed = false,
    ...rest
  } = props;

  const variantClass = resolveVariantClass(variant, pressed);
  const sizeClass =
    variant === "link" ? "text-sm font-medium" : sizeClasses[size];

  const classes = cx(
    "inline-flex items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    fullWidth ? "w-full" : undefined,
    sizeClass,
    variantClass,
    className,
  );

  if (props.as === "a") {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <a
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        data-testid={dataTestId}
        aria-busy={isPending || undefined}
        aria-pressed={variant === "toggle" ? pressed : undefined}
        className={classes}
        {...anchorProps}
      >
        {isPending ? (pendingText ?? children) : children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={buttonProps.type ?? "button"}
      data-testid={dataTestId}
      disabled={buttonProps.disabled || isPending}
      aria-busy={isPending || undefined}
      aria-pressed={variant === "toggle" ? pressed : undefined}
      className={classes}
      {...buttonProps}
    >
      {isPending ? (pendingText ?? children) : children}
    </button>
  );
});

Button.displayName = "Button";
