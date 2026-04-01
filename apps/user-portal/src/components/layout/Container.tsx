import React, { ReactNode } from 'react';

interface ContainerProps {
  /**
   * The content to render inside the container.
   */
  children: ReactNode;
  /**
   * Optional CSS class name for additional styling.
   * Container already applies max-width, centered padding, and responsive behavior.
   */
  className?: string;
  /**
   * Optional max-width constraint. Defaults to 6xl (64rem) for most pages.
   * Options: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /**
   * Optional padding override. Defaults to responsive (px-4 py-10).
   * Pass a tailwind padding class like 'px-8 py-16' to override.
   */
  padding?: string;
  /**
   * Optional data-testid for testing.
   */
  dataTestId?: string;
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Container: Responsive full-width wrapper with max-width, centered padding, and mobile-first breakpoints.
 *
 * Usage:
 * ```tsx
 * <Container>
 *   <h1>My Page</h1>
 *   <p>Content</p>
 * </Container>
 *
 * <Container maxWidth="lg" padding="px-6 py-12">
 *   Custom max-width and padding
 * </Container>
 * ```
 *
 * Responsive behavior:
 * - Mobile: px-4 (16px horizontal padding)
 * - sm (640px+): maintains 16px padding
 * - md (768px+): padding adapts as content expands
 *
 * Token integration: Uses CSS variables for spacing via Tailwind utilities.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className = '', maxWidth = '6xl', padding = 'px-4 py-10', dataTestId }, ref) => {
    const maxWidthClass = maxWidthClasses[maxWidth] || maxWidthClasses['6xl'];

    const classes = `mx-auto w-full ${maxWidthClass} ${padding} ${className}`.trim();

    return (
      <div ref={ref} className={classes} data-testid={dataTestId}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
