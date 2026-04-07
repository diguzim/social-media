import { Section } from '@repo/ui';

interface PersonalSectionProps {
  gender?: string | null;
}

const GENDER_LABEL_BY_VALUE: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
};

function formatGender(gender?: string | null): string {
  if (!gender) {
    return '—';
  }

  return GENDER_LABEL_BY_VALUE[gender] ?? '—';
}

export function PersonalSection({ gender }: PersonalSectionProps) {
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
        <p data-testid="user-profile-personal-gender" className="text-sm text-slate-600">
          Gender: {formatGender(gender)}
        </p>
        <p className="text-sm text-slate-600">Work: —</p>
        <p className="text-sm text-slate-600 sm:col-span-2">Education: —</p>
      </div>
    </Section>
  );
}
