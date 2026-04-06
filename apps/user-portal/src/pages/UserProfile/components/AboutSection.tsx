import { Section } from '@repo/ui';

export function AboutSection() {
  return (
    <Section dataTestId="user-profile-about-section" hasBorder background="primary" padding="p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">About</h2>
        <p className="mt-1 text-sm text-slate-600">Public bio and profile summary.</p>
      </div>

      <p data-testid="user-profile-about-placeholder" className="mt-4 text-sm text-slate-600">
        About information is not available yet.
      </p>
    </Section>
  );
}
