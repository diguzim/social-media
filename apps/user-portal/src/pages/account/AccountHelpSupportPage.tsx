import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountHelpSupportPage() {
  return (
    <section data-testid="account-settings-help-support">
      <AccountSubpageHeader
        testIdPrefix="account-settings-help-support"
        title="Help and support"
        description="Frontend mockup for support channels and self-service resources."
      />

      <div className="mt-5 space-y-3">
        <AccountSettingField
          rootTestId="account-settings-help-support-help-center"
          label="Help center"
          value="Guides for account, posts, friends, and safety."
        />
        <AccountSettingField
          rootTestId="account-settings-help-support-contact-support"
          label="Contact support"
          value="Ticket and live chat placeholders."
        />
        <AccountSettingField
          rootTestId="account-settings-help-support-account-recovery"
          label="Account recovery"
          value="Recovery and access troubleshooting references."
        />
      </div>
    </section>
  );
}
