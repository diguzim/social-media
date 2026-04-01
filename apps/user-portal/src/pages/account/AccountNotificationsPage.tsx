import { AccountSettingField } from './components/AccountSettingField';
import { AccountSubpageHeader } from './components/AccountSubpageHeader';

export function AccountNotificationsPage() {
  return (
    <section data-testid="account-settings-notifications">
      <AccountSubpageHeader
        testIdPrefix="account-settings-notifications"
        title="Notifications"
        description="Frontend mockup for notification preferences and delivery channels."
      />

      <div className="mt-5 space-y-3">
        <AccountSettingField
          rootTestId="account-settings-notifications-social-activity"
          label="Social activity"
          value="Likes, comments, mentions (mock toggles)."
        />
        <AccountSettingField
          rootTestId="account-settings-notifications-friendship-events"
          label="Friendship events"
          value="Requests, accepted requests, suggestions (mock)."
        />
        <AccountSettingField
          rootTestId="account-settings-notifications-delivery-channels"
          label="Delivery channels"
          value="In-app and email channel preferences (mock)."
        />
      </div>
    </section>
  );
}
