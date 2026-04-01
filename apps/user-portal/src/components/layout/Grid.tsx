import React, { ReactNode } from 'react';

interface GridColumnConfig {
  /**
   * Number of columns at default (mobile) breakpoint.
   */
  default?: number;
  /**
   * Number of columns at sm breakpoint (640px+).
   */
  sm?: number;
  /**
   * Number of columns at md breakpoint (768px+).
   */
  md?: number;
  /**
   * Number of columns at lg breakpoint (1024px+).
   */
  lg?: number;
  /**
   * Number of columns at xl breakpoint (1280px+).
   */
  xl?: number;
}

interface GridProps {
  /**
   * The content to render inside the grid.
   */
  children: ReactNode;
  /**
   * Responsive column configuration.
   * Example: { default: 1, sm: 2, md: 3, lg: 4 }
   */
  columns: GridColumnConfig;
  /**
   * Spacing between grid items, using design system spacing scale.
   * Defaults to 'gap-4' (16px).
   */
  gap?: 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-10' | 'gap-12';
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
  /**
   * Optional data-testid for testing.
   */
  dataTestId?: string;
}

/**
 * Grid: Responsive multi-column layout with mobile-first breakpoints.
 *
 * Usage:
 * ```tsx
 * {/* 1 column on mobile, 2 on tablet, 3 on desktop *}
 * <Grid columns={{ default: 1, sm: 2, md: 3 }} gap="gap-6">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 *
 * {/* Feed layout: 1 column on mobile, 2 on large desktop *}
 * <Grid columns={{ default: 1, lg: 2 }}>
 *   <PostCard />
 *   <PostCard />
 * </Grid>
 * ```
 *
 * Breakpoints (mobile-first):
 * - default (0+): base column count
 * - sm (640px+): tablet portrait
 * - md (768px+): small desktop
 * - lg (1024px+): desktop
 * - xl (1280px+): large desktop
 *
 * Token integration: Uses CSS variables for gap (spacing tokens) via Tailwind utilities.
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, columns, gap = 'gap-4', className = '', dataTestId }, ref) => {
    const gridColClasses: string[] = [];

    if (columns.default !== undefined) {
      gridColClasses.push(`grid-cols-${columns.default}`);
    } else {
      gridColClasses.push('grid-cols-1'); // default to 1 column
    }

    if (columns.sm !== undefined) {
      gridColClasses.push(`sm:grid-cols-${columns.sm}`);
    }

    if (columns.md !== undefined) {
      gridColClasses.push(`md:grid-cols-${columns.md}`);
    }

    if (columns.lg !== undefined) {
      gridColClasses.push(`lg:grid-cols-${columns.lg}`);
    }

    if (columns.xl !== undefined) {
      gridColClasses.push(`xl:grid-cols-${columns.xl}`);
    }

    const classes = `grid ${gridColClasses.join(' ')} ${gap} ${className}`.trim();

    return (
      <div ref={ref} className={classes} data-testid={dataTestId}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
