import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useDropdownMenu,
} from '@repo/ui';
import { clearAuth } from '../utils/auth';
import { getUserProfile } from '../services/auth';

interface NavbarMenuItemsProps {
  profilePath: string;
  onLogout: () => void;
}

function NavbarMenuItems({ profilePath, onLogout }: NavbarMenuItemsProps) {
  const { close } = useDropdownMenu();

  return (
    <>
      <Link
        data-testid="navbar-profile-link"
        to={profilePath}
        onClick={close}
        className="block border-b border-slate-200 px-4 py-3 text-sm text-slate-700 no-underline transition hover:bg-slate-100"
      >
        Profile
      </Link>
      <Link
        data-testid="navbar-account-settings-link"
        to="/account/personal-data"
        onClick={close}
        className="block border-b border-slate-200 px-4 py-3 text-sm text-slate-700 no-underline transition hover:bg-slate-100"
      >
        Account settings
      </Link>
      <Button
        type="button"
        variant="destructive"
        fullWidth
        size="sm"
        data-testid="navbar-logout-button"
        onClick={() => {
          close();
          onLogout();
        }}
        className="justify-start rounded-none rounded-b-md px-4 py-3"
      >
        Logout
      </Button>
    </>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const [cachedUser, setCachedUser] = useState(() => getUserProfile());
  const [isAvatarBroken, setIsAvatarBroken] = useState(false);
  const profilePath = cachedUser?.username ? `/users/${cachedUser.username}` : '/';

  useEffect(() => {
    const syncProfile = () => {
      setCachedUser(getUserProfile());
    };

    syncProfile();

    window.addEventListener('storage', syncProfile);
    window.addEventListener('user-profile-updated', syncProfile as EventListener);

    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('user-profile-updated', syncProfile as EventListener);
    };
  }, []);

  useEffect(() => {
    setIsAvatarBroken(false);
  }, [cachedUser?.avatarUrl]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      data-testid="navbar"
      className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white shadow-card sm:px-6"
    >
      <div className="flex items-center gap-4">
        <Link
          data-testid="navbar-home-link"
          to="/"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          Home
        </Link>
        <Link
          data-testid="navbar-my-posts-link"
          to="/my-posts"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          My Posts
        </Link>
        <Link
          data-testid="navbar-friends-link"
          to="/friends"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          Friends
        </Link>
      </div>

      <h1 data-testid="navbar-title" className="text-xl font-bold sm:text-2xl">
        Social Media
      </h1>

      <DropdownMenu dataTestId="navbar-menu-container" className="relative">
        <DropdownMenuTrigger
          asChild
          data-testid="navbar-menu-button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-white/80"
          aria-label="Open user menu"
        >
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/20 text-sm font-semibold text-white transition hover:bg-white/30"
          >
            {cachedUser?.avatarUrl && !isAvatarBroken ? (
              <img
                data-testid="navbar-menu-avatar-image"
                src={cachedUser.avatarUrl}
                alt={`${cachedUser.name ?? 'User'} avatar`}
                className="h-full w-full object-cover"
                onError={() => {
                  setIsAvatarBroken(true);
                }}
              />
            ) : (
              <span data-testid="navbar-menu-avatar-fallback" aria-hidden="true">
                {(cachedUser?.name?.trim().charAt(0) || '?').toUpperCase()}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          dataTestId="navbar-menu-dropdown"
          align="end"
          side="bottom"
          offset="md"
        >
          <NavbarMenuItems profilePath={profilePath} onLogout={handleLogout} />
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
