import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@repo/ui';
import { ProfileGender } from '@repo/contracts/api';
import { getProfile, getUserProfile, updateMyPersonalData } from '../../services/auth';
import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountPersonalDataPage() {
  const user = getUserProfile();
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState<ProfileGender>(
    (user?.gender as ProfileGender | undefined) ?? ProfileGender.PreferNotToSay
  );
  const [about, setAbout] = useState(user?.about ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadFreshProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        const profile = await getProfile();

        if (cancelled) {
          return;
        }

        setName(profile.name ?? '');
        setGender((profile.gender as ProfileGender | undefined) ?? ProfileGender.PreferNotToSay);
        setAbout(profile.about ?? '');
        setProfile(profile);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load personal data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadFreshProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const aboutLength = about.length;
  const isAboutOverLimit = aboutLength > 2000;

  const canSubmit = useMemo(
    () => !isSaving && !isLoading && !isAboutOverLimit && name.trim().length > 0,
    [isAboutOverLimit, isLoading, isSaving, name]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (isAboutOverLimit) {
      setError('About must be 2000 characters or fewer.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await updateMyPersonalData({
        name: name.trim(),
        gender,
        about: about.trim(),
      });

      setName(updatedProfile.name);
      setGender(
        (updatedProfile.gender as ProfileGender | undefined) ?? ProfileGender.PreferNotToSay
      );
      setAbout(updatedProfile.about ?? '');
      setProfile(updatedProfile);
      setSuccess('Personal data updated successfully.');
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'Failed to update personal data'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section data-testid="account-settings-personal-data">
      <AccountSubpageHeader
        testIdPrefix="account-settings-personal-data"
        title="Personal data"
        description="Manage your visible profile fields. Email and username are read-only."
      />

      <form
        data-testid="account-personal-data-form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        <label
          htmlFor="account-personal-name-input"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
          <input
            id="account-personal-name-input"
            data-testid="account-personal-name-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading || isSaving}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <AccountSettingField
          label="Username"
          value={profile?.username ? `@${profile.username}` : '—'}
          valueTestId="account-personal-username"
          className="bg-slate-50 px-4 py-3"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <AccountSettingField
          label="Email"
          value={profile?.email ?? '—'}
          valueTestId="account-personal-email"
          className="bg-slate-50 px-4 py-3 sm:col-span-2"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />
        <label
          htmlFor="account-personal-gender-input"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Gender</p>
          <select
            id="account-personal-gender-input"
            data-testid="account-personal-gender-input"
            value={gender}
            onChange={(event) => setGender(event.target.value as ProfileGender)}
            disabled={isLoading || isSaving}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value={ProfileGender.Female}>Female</option>
            <option value={ProfileGender.Male}>Male</option>
            <option value={ProfileGender.NonBinary}>Non-binary</option>
            <option value={ProfileGender.PreferNotToSay}>Prefer not to say</option>
          </select>
        </label>
        <label
          htmlFor="account-personal-about-input"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:col-span-2"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">About</p>
          <textarea
            id="account-personal-about-input"
            data-testid="account-personal-about-input"
            value={about}
            maxLength={2000}
            onChange={(event) => setAbout(event.target.value)}
            disabled={isLoading || isSaving}
            rows={4}
            className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
          <p
            data-testid="account-personal-about-counter"
            className={`mt-1 text-xs ${isAboutOverLimit ? 'text-red-600' : 'text-slate-500'}`}
          >
            {aboutLength}/2000
          </p>
        </label>
        <AccountSettingField
          label="Verification"
          value={
            profile?.emailVerifiedAt
              ? `Verified on ${new Date(profile.emailVerifiedAt).toLocaleDateString()}`
              : 'Not verified yet'
          }
          valueTestId="account-personal-verification"
          className="bg-slate-50 px-4 py-3 sm:col-span-2"
          labelClassName="text-xs uppercase tracking-wide text-slate-500"
          valueClassName="mt-1 text-sm text-slate-900"
        />

        {error ? (
          <p
            data-testid="account-personal-data-error"
            className="text-sm text-red-600 sm:col-span-2"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            data-testid="account-personal-data-success"
            className="text-sm text-emerald-600 sm:col-span-2"
          >
            {success}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            data-testid="account-personal-data-save-button"
            disabled={!canSubmit}
            isPending={isSaving}
            pendingText="Saving..."
          >
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
