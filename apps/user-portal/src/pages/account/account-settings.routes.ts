export type AccountSettingsSectionKey =
  | 'personal-data'
  | 'privacy'
  | 'security'
  | 'notifications'
  | 'configurations'
  | 'help-support';

export interface AccountSettingsNavItem {
  key: AccountSettingsSectionKey;
  label: string;
  description: string;
  path: `/account/${AccountSettingsSectionKey}`;
}

export const ACCOUNT_SETTINGS_NAV_ITEMS: AccountSettingsNavItem[] = [
  {
    key: 'personal-data',
    label: 'Personal data',
    description: 'Name, username, email, verification, and profile basics.',
    path: '/account/personal-data',
  },
  {
    key: 'privacy',
    label: 'Account privacy',
    description: 'Profile visibility and audience controls.',
    path: '/account/privacy',
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Password and account protection settings.',
    path: '/account/security',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'What alerts you receive and where.',
    path: '/account/notifications',
  },
  {
    key: 'configurations',
    label: 'Configurations',
    description: 'Language, theme, and accessibility preferences.',
    path: '/account/configurations',
  },
  {
    key: 'help-support',
    label: 'Help and support',
    description: 'Support channels, guides, and account recovery resources.',
    path: '/account/help-support',
  },
];
