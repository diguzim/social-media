export type ProfileSectionKey = 'timeline' | 'photos' | 'about' | 'friends' | 'personal';

export interface ProfileSectionTab {
  key: ProfileSectionKey;
  label: string;
}

export const PROFILE_SECTION_TABS: ProfileSectionTab[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'photos', label: 'Photos' },
  { key: 'about', label: 'About' },
  { key: 'friends', label: 'Friends' },
  { key: 'personal', label: 'Personal Data' },
];

const PROFILE_SECTION_KEY_SET = new Set<ProfileSectionKey>(
  PROFILE_SECTION_TABS.map((tab) => tab.key)
);

function isProfileSectionKey(value: string): value is ProfileSectionKey {
  return PROFILE_SECTION_KEY_SET.has(value as ProfileSectionKey);
}

export function normalizeProfileSection(section?: string): ProfileSectionKey {
  if (!section || section === 'timeline') {
    return 'timeline';
  }

  if (section === 'albums') {
    return 'photos';
  }

  return isProfileSectionKey(section) ? section : 'timeline';
}

interface ProfileSectionsTabsProps {
  tabs: ProfileSectionTab[];
  activeSection: ProfileSectionKey;
  onChange: (section: ProfileSectionKey) => void;
  testIdPrefix: string;
}

export function ProfileSectionsTabs({
  tabs,
  activeSection,
  onChange,
  testIdPrefix,
}: ProfileSectionsTabsProps) {
  return (
    <div
      data-testid={`${testIdPrefix}-tabs`}
      className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3"
      role="tablist"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeSection;

        return (
          <button
            key={tab.key}
            data-testid={`${testIdPrefix}-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              onChange(tab.key);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
