import type { HTMLAttributes, ReactNode } from "react";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "../layout-components/utils.js";

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel: string;
  dataTestId?: string;
  overlayTestId?: string;
  dialogTestId?: string;
  closeButtonTestId?: string;
  closeButtonLabel?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  dialogClassName?: string;
}

function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    isOpen,
    onClose,
    children,
    ariaLabel,
    dataTestId = "modal",
    overlayTestId,
    dialogTestId,
    closeButtonTestId,
    closeButtonLabel = "Close dialog",
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    overlayClassName,
    dialogClassName,
    className,
    ...props
  },
  ref,
) {
  const fallbackId = useId();
  const overlayId = overlayTestId ?? `${dataTestId}-overlay`;
  const dialogId = dialogTestId ?? `${dataTestId}-dialog`;
  const closeId = closeButtonTestId ?? `${dataTestId}-close-button`;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useImperativeHandle(ref, () => dialogRef.current as HTMLDivElement, []);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const headingId = `${fallbackId}-heading`;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      data-testid={dataTestId}
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4",
        overlayClassName,
      )}
    >
      <button
        type="button"
        aria-label={closeButtonLabel}
        data-testid={overlayId}
        className="absolute inset-0 cursor-default"
        onClick={handleOverlayClick}
      />
      <div
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : headingId}
        tabIndex={-1}
        data-testid={`${dataTestId}-panel`}
        className={cx(
          "relative z-10 w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white p-4 shadow-xl outline-none",
          dialogClassName,
          className,
        )}
        {...props}
      >
        {showCloseButton ? (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              data-testid={closeId}
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
        ) : null}
        <div id={headingId}>{children}</div>
      </div>
    </div>,
    document.body,
  );
});

Modal.displayName = "Modal";
