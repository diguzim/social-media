import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountSecurityPage() {
  return (
    <section data-testid="account-settings-security">
      <AccountSubpageHeader
        testIdPrefix="account-settings-security"
        title="Security"
        description="Frontend mockup for password and account protection controls."
      />

      <div className="mt-5 space-y-3">
        <AccountSettingField
          rootTestId="account-settings-security-password-management"
          label="Password management"
          value="Change password flow placeholder."
        />
        <AccountSettingField
          rootTestId="account-settings-security-two-factor-authentication"
          label="Two-factor authentication"
          value="2FA setup options (future feature)."
        />
        <AccountSettingField
          rootTestId="account-settings-security-active-sessions"
          label="Active sessions"
          value="Review and revoke sessions (future feature)."
        />
      </div>
    </section>
  );
}
