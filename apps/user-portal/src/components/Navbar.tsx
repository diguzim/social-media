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
  const cachedUser = getUserProfile();
  const profilePath = cachedUser?.username ? `/users/${cachedUser.username}` : '/';

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
          data-testid="navbar-menu-button"
          className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/80"
        >
          Menu ▼
        </DropdownMenuTrigger>

        <DropdownMenuContent
          dataTestId="navbar-menu-dropdown"
          className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
        >
          <NavbarMenuItems profilePath={profilePath} onLogout={handleLogout} />
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
