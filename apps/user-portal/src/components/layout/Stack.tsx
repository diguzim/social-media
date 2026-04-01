import React, { ReactNode } from 'react';

type Axis = 'vertical' | 'horizontal';
type AlignItems = 'start' | 'center' | 'end' | 'stretch';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around';

interface StackProps {
  /**
   * The content to render inside the stack.
   */
  children: ReactNode;
  /**
   * Stack direction: 'vertical' (flex-col) or 'horizontal' (flex-row).
   * Defaults to 'vertical'.
   */
  direction?: Axis;
  /**
   * Spacing between items, using design system spacing scale.
   * Defaults to 'gap-4' (16px).
   * Options: 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-10', 'gap-12'
   */
  gap?: 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-10' | 'gap-12';
  /**
   * Vertical alignment (cross-axis).
   * For vertical stacks: 'start' | 'center' | 'end' | 'stretch'
   * For horizontal stacks: affects vertical alignment
   */
  align?: AlignItems;
  /**
   * Horizontal alignment (main-axis).
   * 'start' | 'center' | 'end' | 'between' | 'around'
   */
  justify?: JustifyContent;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
  /**
   * Optional data-testid for testing.
   */
  dataTestId?: string;
}

const alignClasses: Record<AlignItems, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses: Record<JustifyContent, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

/**
 * Stack: Flexible container for stacking items vertically or horizontally with consistent gaps.
 *
 * Usage:
 * ```tsx
 * {/* Vertical stack with default gap *}
 * <Stack>
 *   <Header />
 *   <Content />
 *   <Footer />
 * </Stack>
 *
 * {/* Horizontal stack with custom gap and alignment *}
 * <Stack direction="horizontal" gap="gap-6" align="center" justify="between">
 *   <Logo />
 *   <Nav />
 *   <UserMenu />
 * </Stack>
 * ```
 *
 * Token integration: Uses CSS variables for gap (spacing tokens) via Tailwind utilities.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      direction = 'vertical',
      gap = 'gap-4',
      align = 'stretch',
      justify = 'start',
      className = '',
      dataTestId,
    },
    ref
  ) => {
    const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row';
    const alignClass = alignClasses[align] || alignClasses['stretch'];
    const justifyClass = justifyClasses[justify] || justifyClasses['start'];

    const classes =
      `flex ${directionClass} ${gap} ${alignClass} ${justifyClass} ${className}`.trim();

    return (
      <div ref={ref} className={classes} data-testid={dataTestId}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
