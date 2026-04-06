import type { ButtonSize, ButtonVariant } from "../button/button.js";
import { Button } from "../button/button.js";
import {
  FloatingPanel,
  type FloatingPanelAlign,
  type FloatingPanelOffset,
  type FloatingPanelSide,
} from "./floating-panel.js";
import { cx } from "../layout-components/utils.js";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  close: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenuInternal(): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);

  if (!context) {
    throw new Error(
      "DropdownMenu components must be used within <DropdownMenu>",
    );
  }

  return context;
}

export function useDropdownMenu() {
  return useDropdownMenuInternal();
}

export interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  dataTestId?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export function DropdownMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  dataTestId,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) {
      return;
    }

    const handlePointerDown = (event: globalThis.MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [close, closeOnOutsideClick, isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [close, closeOnEscape, isOpen]);

  const value = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      toggle,
      close,
    }),
    [close, isOpen, setOpen, toggle],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <div
        ref={containerRef}
        data-testid={dataTestId}
        className={cx("relative", className)}
      >
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isPending?: boolean;
  pendingText?: string;
  dataTestId?: string;
  pressed?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export function DropdownMenuTrigger({
  children,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { toggle, open } = useDropdownMenuInternal();

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      toggle();
    }
  };

  return (
    <Button
      {...props}
      type="button"
      onClick={handleClick}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {children}
    </Button>
  );
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  dataTestId?: string;
  unmountOnClose?: boolean;
  side?: FloatingPanelSide;
  align?: FloatingPanelAlign;
  offset?: FloatingPanelOffset;
}

export function DropdownMenuContent({
  children,
  className,
  dataTestId,
  unmountOnClose = true,
  side = "bottom",
  align = "end",
  offset = "md",
  ...props
}: DropdownMenuContentProps) {
  const { open } = useDropdownMenuInternal();

  if (!open && unmountOnClose) {
    return null;
  }

  return (
    <FloatingPanel
      {...props}
      dataTestId={dataTestId}
      role="menu"
      side={side}
      align={align}
      offset={offset}
      className={cx(!open && !unmountOnClose ? "hidden" : undefined, className)}
    >
      {children}
    </FloatingPanel>
  );
}
