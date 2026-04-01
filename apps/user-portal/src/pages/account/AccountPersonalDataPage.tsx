import { getUserProfile } from '../../services/auth';
import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountPersonalDataPage() {
  const user = getUserProfile();

  return (
    <section data-testid="account-settings-personal-data">
      <AccountSubpageHeader
        testIdPrefix="account-settings-personal-data"
        title="Personal data"
        description="Core account identity fields available in the current frontend contract."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <AccountSettingField
          label="Name"
          value={user?.name ?? '—'}
          valueTestId="account-personal-name"
          className="bg-slate-50 px-4 py-3"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="Username"
          value={user?.username ? `@${user.username}` : '—'}
          valueTestId="account-personal-username"
          className="bg-slate-50 px-4 py-3"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="Email"
          value={user?.email ?? '—'}
          valueTestId="account-personal-email"
          className="bg-slate-50 px-4 py-3 sm:col-span-2"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="Gender"
          value="—"
          valueTestId="account-personal-gender"
          className="bg-slate-50 px-4 py-3"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="About"
          value="—"
          valueTestId="account-personal-about"
          className="bg-slate-50 px-4 py-3"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="Verification"
          value={
            user?.emailVerifiedAt
              ? `Verified on ${new Date(user.emailVerifiedAt).toLocaleDateString()}`
              : 'Not verified yet'
          }
          valueTestId="account-personal-verification"
          className="bg-slate-50 px-4 py-3 sm:col-span-2"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
      </div>
    </section>
  );
}
