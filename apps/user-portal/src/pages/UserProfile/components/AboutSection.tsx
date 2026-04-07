import { Section } from '@repo/ui';

interface AboutSectionProps {
  about?: string | null;
}

export function AboutSection({ about }: AboutSectionProps) {
  const normalizedAbout = about?.trim();

  return (
    <Section dataTestId="user-profile-about-section" hasBorder background="primary" padding="p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">About</h2>
        <p className="mt-1 text-sm text-slate-600">Public bio and profile summary.</p>
      </div>

      {normalizedAbout ? (
        <p
          data-testid="user-profile-about-text"
          className="mt-4 whitespace-pre-wrap text-sm text-slate-700"
        >
          {normalizedAbout}
        </p>
      ) : (
        <p data-testid="user-profile-about-placeholder" className="mt-4 text-sm text-slate-600">
          About information is not available yet.
        </p>
      )}
    </Section>
  );
}
