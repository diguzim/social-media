import { Link, Outlet, useLocation } from 'react-router-dom';
import { ACCOUNT_SETTINGS_NAV_ITEMS } from './account-settings.routes';

export function AccountSettingsLayout() {
  const location = useLocation();

  return (
    <div data-testid="account-settings-page" className="page-container max-w-6xl">
      <header className="mb-6">
        <h1 data-testid="account-settings-title" className="text-3xl font-bold text-slate-900">
          Account settings
        </h1>
        <p data-testid="account-settings-subtitle" className="mt-2 text-sm text-slate-600">
          Manage your account preferences and profile-related data.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside
          data-testid="account-settings-navigation"
          className="card h-fit p-3"
          aria-label="Account settings navigation"
        >
          <nav className="flex flex-col gap-2">
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
        </aside>

        <main data-testid="account-settings-content" className="card p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
