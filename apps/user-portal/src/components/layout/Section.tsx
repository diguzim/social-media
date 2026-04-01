import React, { ReactNode } from 'react';

interface SectionProps {
  /**
   * The content to render inside the section.
   */
  children: ReactNode;
  /**
   * Semantic title/heading for the section.
   */
  title?: string;
  /**
   * Optional subtitle or description.
   */
  subtitle?: string;
  /**
   * Optional background color using design tokens.
   * 'primary' | 'secondary' | 'accent' | 'danger' | 'transparent'
   */
  background?: 'primary' | 'secondary' | 'accent' | 'danger' | 'transparent';
  /**
   * Optional border variant.
   * true for default border, false for no border, or pass a custom tailwind class.
   */
  hasBorder?: boolean;
  /**
   * Padding using design system spacing.
   * Defaults to 'p-6' (24px).
   */
  padding?: string;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
  /**
   * Optional data-testid for testing.
   */
  dataTestId?: string;
}

const backgroundClasses: Record<string, string> = {
  primary: 'bg-white',
  secondary: 'bg-gray-50',
  accent: 'bg-blue-50',
  danger: 'bg-red-50',
  transparent: 'bg-transparent',
};

/**
 * Section: Semantic grouping container with optional title, background, border, and padding.
 * Useful for creating distinct content regions with consistent styling.
 *
 * Usage:
 * ```tsx
 * <Section title="Personal Information">
 *   <p>Your profile details go here.</p>
 * </Section>
 *
 * <Section
 *   title="Recent Posts"
 *   subtitle="Your latest activity"
 *   background="accent"
 *   hasBorder
 * >
 *   <PostList />
 * </Section>
 *
 * <Section background="transparent" padding="p-4">
 *   Compact content section without background
 * </Section>
 * ```
 *
 * Semantic accessibility:
 * - Renders as <section> element for proper document outline
 * - Title rendered as <h2> for hierarchy when present
 * - Use multiple sections to structure page content clearly
 *
 * Token integration: Uses CSS variables for padding and colors via Tailwind utilities.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      title,
      subtitle,
      background = 'primary',
      hasBorder = false,
      padding = 'p-6',
      className = '',
      dataTestId,
    },
    ref
  ) => {
    const bgClass = backgroundClasses[background] || backgroundClasses['primary'];
    const borderClass = hasBorder ? 'border border-slate-200' : '';
    const radiusClass = 'rounded-lg';

    const containerClasses =
      `${bgClass} ${borderClass} ${radiusClass} ${padding} ${className}`.trim();

    return (
      <section ref={ref} className={containerClasses} data-testid={dataTestId}>
        {title && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
