import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountPrivacyPage() {
  return (
    <section data-testid="account-settings-privacy">
      <AccountSubpageHeader
        testIdPrefix="account-settings-privacy"
        title="Account privacy"
        description="Frontend mockup for privacy controls (backend wiring planned for future iterations)."
      />

      <div className="mt-5 space-y-3">
        <AccountSettingField
          rootTestId="account-settings-privacy-profile-visibility"
          label="Profile visibility"
          value="Public profile (default for now)."
        />
        <AccountSettingField
          rootTestId="account-settings-privacy-friend-request-permissions"
          label="Friend request permissions"
          value="Everyone can send requests (mock)."
        />
        <AccountSettingField
          rootTestId="account-settings-privacy-activity-visibility"
          label="Activity visibility"
          value="Timeline visibility controls coming soon."
        />
      </div>
    </section>
  );
}
