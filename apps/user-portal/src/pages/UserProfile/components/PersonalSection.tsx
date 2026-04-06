import { Section } from '@repo/ui';

export function PersonalSection() {
  return (
    <Section
      dataTestId="user-profile-personal-section"
      hasBorder
      background="primary"
      padding="p-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Personal Data</h2>
        <p className="mt-1 text-sm text-slate-600">
          Location, birth date, gender, work, and education.
        </p>
      </div>

      <div
        data-testid="user-profile-personal-placeholder"
        className="mt-4 grid gap-2 sm:grid-cols-2"
      >
        <p className="text-sm text-slate-600">Location: —</p>
        <p className="text-sm text-slate-600">Birth date: —</p>
        <p className="text-sm text-slate-600">Gender: —</p>
        <p className="text-sm text-slate-600">Work: —</p>
        <p className="text-sm text-slate-600 sm:col-span-2">Education: —</p>
      </div>
    </Section>
  );
}
