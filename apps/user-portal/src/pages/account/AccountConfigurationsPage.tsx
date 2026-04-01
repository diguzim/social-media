import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountConfigurationsPage() {
  return (
    <section data-testid="account-settings-configurations">
      <AccountSubpageHeader
        testIdPrefix="account-settings-configurations"
        title="Configurations"
        description="Frontend mockup for user preferences such as language, theme, and accessibility."
      />

      <div className="mt-5 space-y-3">
        <AccountSettingField
          rootTestId="account-settings-configurations-language"
          label="Language"
          value="English (default; i18n integration pending)."
        />
        <AccountSettingField
          rootTestId="account-settings-configurations-theme"
          label="Theme"
          value="System theme (mock preference)."
        />
        <AccountSettingField
          rootTestId="account-settings-configurations-accessibility"
          label="Accessibility"
          value="Text scaling and reduced motion options (mock)."
        />
      </div>
    </section>
  );
}
