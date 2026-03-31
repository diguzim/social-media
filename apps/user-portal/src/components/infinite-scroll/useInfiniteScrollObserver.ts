import { useEffect, useRef } from 'react';

interface UseInfiniteScrollObserverParams {
  enabled: boolean;
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScrollObserver({
  enabled,
  onIntersect,
  rootMargin = '200px 0px',
  threshold = 0,
}: UseInfiniteScrollObserverParams) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const target = sentinelRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) {
          return;
        }

        onIntersect();
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, rootMargin, threshold]);

  return sentinelRef;
}
