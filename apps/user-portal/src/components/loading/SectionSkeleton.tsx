import { LoadingBlock } from './LoadingBlock';

interface SectionSkeletonProps {
  title?: string;
  variant?: 'profile' | 'form' | 'list' | 'card';
  lines?: number;
  minHeight?: number | string;
  dataTestId?: string;
}

export function SectionSkeleton({
  title,
  variant = 'card',
  lines = 3,
  minHeight,
  dataTestId,
}: SectionSkeletonProps) {
  const style = minHeight ? { minHeight } : undefined;

  return (
    <section data-testid={dataTestId} className="card px-6 py-5" style={style}>
      {title && <h2 className="mb-4 text-2xl font-semibold text-slate-900">{title}</h2>}

      {variant === 'profile' && (
        <div className="space-y-4">
          <LoadingBlock height="2.5rem" width="55%" dataTestId="section-skeleton-profile-title" />
          <LoadingBlock height="5.5rem" rounded="rounded-lg" />
          <div className="space-y-3">
            <LoadingBlock height="1rem" width="40%" />
            <LoadingBlock height="1rem" width="65%" />
            <LoadingBlock height="1rem" width="50%" />
          </div>
        </div>
      )}

      {variant === 'form' && (
        <div className="space-y-4">
          <LoadingBlock height="1rem" width="28%" />
          <LoadingBlock height="2.5rem" />
          <LoadingBlock height="1rem" width="28%" />
          <LoadingBlock height="6rem" />
          <LoadingBlock height="2.75rem" width="100%" rounded="rounded-md" />
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-3">
          {Array.from({ length: Math.max(lines, 2) }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4">
              <LoadingBlock height="1.25rem" width={`${60 - index * 5}%`} />
              <LoadingBlock height="1rem" width="35%" className="mt-3" />
              <LoadingBlock height="1rem" width="90%" className="mt-3" />
              <LoadingBlock height="1rem" width="78%" className="mt-2" />
            </div>
          ))}
        </div>
      )}

      {variant === 'card' && (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <LoadingBlock key={index} height="1rem" width={`${100 - index * 12}%`} />
          ))}
        </div>
      )}
    </section>
  );
}
