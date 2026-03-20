import type { ButtonHTMLAttributes } from 'react';

interface PendingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPending: boolean;
  idleText: string;
  pendingText: string;
}

export function PendingButton({
  isPending,
  idleText,
  pendingText,
  disabled,
  className,
  type = 'button',
  ...rest
}: PendingButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || isPending}
      aria-busy={isPending}
      className={className}
    >
      {isPending ? pendingText : idleText}
    </button>
  );
}
