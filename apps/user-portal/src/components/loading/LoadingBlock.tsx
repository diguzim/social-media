import type { CSSProperties } from 'react';

interface LoadingBlockProps {
  height?: number | string;
  width?: number | string;
  rounded?: string;
  className?: string;
  dataTestId?: string;
}

export function LoadingBlock({
  height = '1rem',
  width = '100%',
  rounded = 'rounded-md',
  className = '',
  dataTestId,
}: LoadingBlockProps) {
  const style: CSSProperties = {
    height,
    width,
  };

  return (
    <div
      data-testid={dataTestId}
      aria-hidden="true"
      className={`animate-pulse bg-slate-200 ${rounded} ${className}`.trim()}
      style={style}
    />
  );
}
