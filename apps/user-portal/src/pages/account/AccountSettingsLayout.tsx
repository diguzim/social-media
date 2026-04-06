import { Link, Outlet, useLocation } from 'react-router-dom';
import { Container, Grid, Section, Stack } from '@repo/ui';
import { ACCOUNT_SETTINGS_NAV_ITEMS } from './account-settings.routes';

export function AccountSettingsLayout() {
  const location = useLocation();

  return (
    <Container maxWidth="6xl" dataTestId="account-settings-page">
      <Stack gap="gap-6">
        <header>
          <h1 data-testid="account-settings-title" className="text-3xl font-bold text-slate-900">
            Account settings
          </h1>
          <p data-testid="account-settings-subtitle" className="mt-2 text-sm text-slate-600">
            Manage your account preferences and profile-related data.
          </p>
        </header>

        <Grid columns={{ base: 1, lg: 12 }} gap="gap-5">
          <Section
            background="primary"
            hasBorder
            dataTestId="account-settings-navigation"
            className="h-fit lg:col-span-3"
            padding="p-3"
          >
            <nav className="flex flex-col gap-2" aria-label="Account settings navigation">
              {ACCOUNT_SETTINGS_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    data-testid={`account-settings-nav-${item.key}`}
                    className={`rounded-md border px-3 py-2 no-underline transition ${
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                  </Link>
                );
              })}
            </nav>
          </Section>

          <Section
            background="primary"
            hasBorder
            dataTestId="account-settings-content"
            className="lg:col-span-9"
            padding="p-5"
          >
            <Outlet />
          </Section>
        </Grid>
      </Stack>
    </Container>
  );
}
